# Script de génération du QR Code haute définition pour le CV
param (
    [string]$Url = "https://github.com/Baptiste-archerDev/Portfolio.git",
    [string]$OutputFile = "qr-code.png",
    [int]$ModuleSize = 16,
    [int]$Border = 4
)

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $here) { $here = Get-Location }
$targetPath = Join-Path $here $OutputFile

$csharpCode = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Text;

public class QrCodeMaker {
    static byte[] exp = new byte[512];
    static byte[] log = new byte[256];

    static QrCodeMaker() {
        int x = 1;
        for (int i = 0; i < 255; i++) {
            exp[i] = (byte)x;
            exp[i + 255] = (byte)x;
            log[x] = (byte)i;
            x <<= 1;
            if ((x & 0x100) != 0) x ^= 0x11D;
        }
    }

    static byte GfMul(byte a, byte b) {
        if (a == 0 || b == 0) return 0;
        return exp[log[a] + log[b]];
    }

    static byte[] RsGeneratorPoly(int degree) {
        byte[] g = new byte[degree + 1];
        g[0] = 1;
        for (int i = 0; i < degree; i++) {
            byte root = exp[i];
            for (int j = i; j >= 0; j--) {
                g[j + 1] ^= g[j];
                g[j] = GfMul(g[j], root);
            }
        }
        Array.Reverse(g);
        return g;
    }

    static byte[] ComputeEc(byte[] data, int ecCount) {
        byte[] gen = RsGeneratorPoly(ecCount);
        byte[] res = new byte[ecCount];
        foreach (byte b in data) {
            byte factor = (byte)(b ^ res[0]);
            for (int j = 0; j < ecCount - 1; j++) {
                res[j] = (byte)(res[j + 1] ^ GfMul(factor, gen[j + 1]));
            }
            res[ecCount - 1] = GfMul(factor, gen[ecCount]);
        }
        return res;
    }

    static void SetFunction(bool[,] modules, bool[,] isFunction, int x, int y, bool val) {
        modules[y, x] = val;
        isFunction[y, x] = true;
    }

    static void WriteBits(byte[] buf, ref int bitPos, int val, int count) {
        for (int b = count - 1; b >= 0; b--) {
            int bit = (val >> b) & 1;
            buf[bitPos >> 3] |= (byte)(bit << (7 - (bitPos & 7)));
            bitPos++;
        }
    }

    public static bool[,] GenerateMatrix(string text) {
        int size = 33; // Version 4 (33x33)
        bool[,] modules = new bool[size, size];
        bool[,] isFunction = new bool[size, size];

        // 1. Finder patterns at (3,3), (size-4, 3), (3, size-4)
        int[] finderCenters = new int[] { 3, size - 4 };
        foreach (int cy in finderCenters) {
            foreach (int cx in finderCenters) {
                if (cx == size - 4 && cy == size - 4) continue; // skip bottom-right
                for (int dy = -4; dy <= 4; dy++) {
                    for (int dx = -4; dx <= 4; dx++) {
                        int dist = Math.Max(Math.Abs(dx), Math.Abs(dy));
                        int xx = cx + dx;
                        int yy = cy + dy;
                        if (xx >= 0 && xx < size && yy >= 0 && yy < size) {
                            SetFunction(modules, isFunction, xx, yy, dist != 2 && dist != 4);
                        }
                    }
                }
            }
        }

        // 2. Alignment pattern at (26, 26)
        for (int dy = -2; dy <= 2; dy++) {
            for (int dx = -2; dx <= 2; dx++) {
                int dist = Math.Max(Math.Abs(dx), Math.Abs(dy));
                SetFunction(modules, isFunction, 26 + dx, 26 + dy, dist != 1);
            }
        }

        // 3. Timing patterns
        for (int i = 8; i < size - 8; i++) {
            SetFunction(modules, isFunction, i, 6, i % 2 == 0);
            SetFunction(modules, isFunction, 6, i, i % 2 == 0);
        }

        // 4. Dark module at (8, size - 8) -> (8, 25)
        SetFunction(modules, isFunction, 8, size - 8, true);

        // 5. Reserve format bits areas
        for (int i = 0; i <= 8; i++) {
            if (!isFunction[i, 8]) SetFunction(modules, isFunction, 8, i, false);
            if (!isFunction[8, i]) SetFunction(modules, isFunction, i, 8, false);
        }
        for (int i = 0; i < 8; i++) {
            SetFunction(modules, isFunction, size - 1 - i, 8, false);
            SetFunction(modules, isFunction, 8, size - 1 - i, false);
        }

        // 6. Encode data: Byte Mode (0100) + 8-bit length + data + terminator + pad
        byte[] textBytes = Encoding.ASCII.GetBytes(text);
        int totalDataBytes = 64; // Level M
        byte[] dataCodewords = new byte[totalDataBytes];
        int bitPos = 0;

        WriteBits(dataCodewords, ref bitPos, 4, 4); // Byte mode = 0100
        WriteBits(dataCodewords, ref bitPos, textBytes.Length, 8); // Count
        foreach (byte b in textBytes) {
            WriteBits(dataCodewords, ref bitPos, b, 8);
        }
        // Terminator (up to 4 zeroes)
        int term = Math.Min(4, totalDataBytes * 8 - bitPos);
        WriteBits(dataCodewords, ref bitPos, 0, term);
        // Pad to byte boundary
        if ((bitPos & 7) != 0) {
            WriteBits(dataCodewords, ref bitPos, 0, 8 - (bitPos & 7));
        }
        // Pad bytes 0xEC, 0x11
        byte[] padBytes = new byte[] { 0xEC, 0x11 };
        int padIdx = 0;
        while (bitPos < totalDataBytes * 8) {
            WriteBits(dataCodewords, ref bitPos, padBytes[padIdx % 2], 8);
            padIdx++;
        }

        // Split into 2 blocks of 32 bytes
        byte[] b1 = new byte[32];
        byte[] b2 = new byte[32];
        Array.Copy(dataCodewords, 0, b1, 0, 32);
        Array.Copy(dataCodewords, 32, b2, 0, 32);

        byte[] ec1 = ComputeEc(b1, 18);
        byte[] ec2 = ComputeEc(b2, 18);

        // Interleave codewords
        byte[] allCodewords = new byte[100];
        int idx = 0;
        for (int i = 0; i < 32; i++) {
            allCodewords[idx++] = b1[i];
            allCodewords[idx++] = b2[i];
        }
        for (int i = 0; i < 18; i++) {
            allCodewords[idx++] = ec1[i];
            allCodewords[idx++] = ec2[i];
        }

        // Draw codewords in zigzag scan
        int bitIndex = 0;
        int totalBits = 100 * 8 + 7; // 807 bits (including 7 remainder bits)

        for (int right = size - 1; right >= 1; right -= 2) {
            if (right == 6) right = 5;
            for (int vert = 0; vert < size; vert++) {
                for (int j = 0; j < 2; j++) {
                    int x = right - j;
                    bool upward = ((right + 1) & 2) == 0;
                    int y = upward ? (size - 1 - vert) : vert;

                    if (!isFunction[y, x] && bitIndex < totalBits) {
                        int bit = 0;
                        if (bitIndex < 100 * 8) {
                            bit = (allCodewords[bitIndex >> 3] >> (7 - (bitIndex & 7))) & 1;
                        }
                        modules[y, x] = (bit == 1);
                        bitIndex++;
                    }
                }
            }
        }

        // Apply best mask (0..7)
        int bestMask = 0;
        long lowestPenalty = long.MaxValue;
        bool[,] bestModules = new bool[size, size];

        for (int mask = 0; mask < 8; mask++) {
            bool[,] testModules = (bool[,])modules.Clone();
            ApplyMask(testModules, isFunction, size, mask);
            DrawFormatBits(testModules, size, 0 /* M */, mask);
            long pen = GetPenalty(testModules, size);
            if (pen < lowestPenalty) {
                lowestPenalty = pen;
                bestMask = mask;
                bestModules = testModules;
            }
        }

        return bestModules;
    }

    static void ApplyMask(bool[,] m, bool[,] isFunc, int size, int mask) {
        for (int y = 0; y < size; y++) {
            for (int x = 0; x < size; x++) {
                if (isFunc[y, x]) continue;
                bool invert = false;
                switch (mask) {
                    case 0: invert = (x + y) % 2 == 0; break;
                    case 1: invert = y % 2 == 0; break;
                    case 2: invert = x % 3 == 0; break;
                    case 3: invert = (x + y) % 3 == 0; break;
                    case 4: invert = (y / 2 + x / 3) % 2 == 0; break;
                    case 5: invert = ((x * y) % 2 + (x * y) % 3) == 0; break;
                    case 6: invert = (((x * y) % 2 + (x * y) % 3) % 2) == 0; break;
                    case 7: invert = (((x + y) % 2 + (x * y) % 3) % 2) == 0; break;
                }
                if (invert) m[y, x] = !m[y, x];
            }
        }
    }

    static void DrawFormatBits(bool[,] m, int size, int eclBits, int mask) {
        int data = (eclBits << 3) | mask;
        int rem = data;
        for (int i = 0; i < 10; i++)
            rem = (rem << 1) ^ ((rem >> 9) * 0x537);
        int bits = ((data << 10) | rem) ^ 0x5412;

        // First copy (top-left)
        for (int i = 0; i <= 5; i++) m[i, 8] = ((bits >> i) & 1) != 0;
        m[7, 8] = ((bits >> 6) & 1) != 0;
        m[8, 8] = ((bits >> 7) & 1) != 0;
        m[8, 7] = ((bits >> 8) & 1) != 0;
        for (int i = 9; i <= 14; i++) m[8, 14 - i] = ((bits >> i) & 1) != 0;

        // Second copy
        for (int i = 0; i <= 7; i++) m[8, size - 1 - i] = ((bits >> i) & 1) != 0;
        for (int i = 8; i < 15; i++) m[size - 15 + i, 8] = ((bits >> i) & 1) != 0;
        m[size - 8, 8] = true; // dark module
    }

    static long GetPenalty(bool[,] m, int size) {
        long p = 0;
        // Rule 1: rows & cols runs
        for (int y = 0; y < size; y++) {
            bool color = false; int len = 0;
            for (int x = 0; x < size; x++) {
                if (m[y, x] == color) {
                    len++;
                    if (len == 5) p += 3;
                    else if (len > 5) p++;
                } else { color = m[y, x]; len = 1; }
            }
        }
        for (int x = 0; x < size; x++) {
            bool color = false; int len = 0;
            for (int y = 0; y < size; y++) {
                if (m[y, x] == color) {
                    len++;
                    if (len == 5) p += 3;
                    else if (len > 5) p++;
                } else { color = m[y, x]; len = 1; }
            }
        }
        // Rule 2: 2x2
        for (int y = 0; y < size - 1; y++) {
            for (int x = 0; x < size - 1; x++) {
                bool c = m[y, x];
                if (c == m[y, x + 1] && c == m[y + 1, x] && c == m[y + 1, x + 1]) p += 3;
            }
        }
        // Rule 4: Balance
        int dark = 0;
        for (int y = 0; y < size; y++)
            for (int x = 0; x < size; x++)
                if (m[y, x]) dark++;
        int total = size * size;
        int k = Math.Abs(dark * 20 - total * 10) / total;
        p += k * 10;
        return p;
    }

    public static void SavePng(string text, string outputPath, int moduleSize, int border) {
        bool[,] matrix = GenerateMatrix(text);
        int size = matrix.GetLength(0);
        int imgSize = (size + 2 * border) * moduleSize;

        using (Bitmap bmp = new Bitmap(imgSize, imgSize, PixelFormat.Format32bppArgb))
        using (Graphics g = Graphics.FromImage(bmp)) {
            g.Clear(Color.White);
            using (SolidBrush brush = new SolidBrush(Color.Black)) {
                for (int y = 0; y < size; y++) {
                    for (int x = 0; x < size; x++) {
                        if (matrix[y, x]) {
                            g.FillRectangle(brush, (x + border) * moduleSize, (y + border) * moduleSize, moduleSize, moduleSize);
                        }
                    }
                }
            }
            bmp.Save(outputPath, ImageFormat.Png);
        }
    }
}
"@

Add-Type -TypeDefinition $csharpCode -ReferencedAssemblies "System.Drawing"
[QrCodeMaker]::SavePng($Url, $targetPath, $ModuleSize, $Border)

if (Test-Path $targetPath) {
    Write-Host "QR Code généré avec succès pour '$Url' -> $targetPath"
} else {
    Write-Error "Échec de génération du QR Code."
}

