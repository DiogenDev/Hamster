using System;
using System.Runtime.InteropServices;

class WallpaperHelper {
    [DllImport("user32.dll", SetLastError = true)]
    static extern IntPtr OpenDesktop(string lpszDesktop, int dwFlags, bool fInherit, uint dwDesiredAccess);

    [DllImport("user32.dll", SetLastError = true)]
    static extern bool SetThreadDesktop(IntPtr hDesktop);

    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    static extern IntPtr FindWindowEx(IntPtr parentHandle, IntPtr childAfter, string className, string windowTitle);

    [DllImport("user32.dll", SetLastError = true)]
    static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam, uint fuFlags, uint uTimeout, out IntPtr lpdwResult);

    [DllImport("user32.dll")]
    static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

    [DllImport("user32.dll", SetLastError = true)]
    static extern IntPtr SetParent(IntPtr hWndChild, IntPtr hWndNewParent);

    [DllImport("user32.dll")]
    static extern int GetWindowLong(IntPtr hWnd, int nIndex);

    [DllImport("user32.dll")]
    static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

    [DllImport("user32.dll")]
    static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    [DllImport("user32.dll")]
    static extern int GetSystemMetrics(int nIndex);

    delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    const int GWL_STYLE = -16;
    const int GWL_EXSTYLE = -20;
    const int WS_CHILD = 0x40000000;
    const int WS_POPUP = unchecked((int)0x80000000);
    const int WS_EX_TOOLWINDOW = 0x00000080;
    const int WS_EX_APPWINDOW = 0x00040000;

    static readonly IntPtr HWND_BOTTOM = new IntPtr(1);
    const uint SWP_NOSIZE = 0x0001;
    const uint SWP_NOMOVE = 0x0002;
    const uint SWP_NOACTIVATE = 0x0010;
    const uint SWP_SHOWWINDOW = 0x0040;

    static void Main(string[] args) {
        if (args.Length < 2) {
            Console.WriteLine("Usage: WallpaperHelper.exe <attach|detach> <HWND>");
            return;
        }

        string action = args[0].ToLowerInvariant();
        long hwndLong = 0;
        if (!long.TryParse(args[1], out hwndLong)) {
            Console.WriteLine("Invalid HWND: " + args[1]);
            return;
        }

        IntPtr targetHwnd = new IntPtr(hwndLong);

        IntPtr hDesk = OpenDesktop("Default", 0, false, 0x01FF);
        if (hDesk != IntPtr.Zero) {
            SetThreadDesktop(hDesk);
        }

        if (action == "attach") {
            IntPtr progman = FindWindow("Progman", null);
            if (progman == IntPtr.Zero) {
                Console.WriteLine("Progman not found.");
                return;
            }

            IntPtr res;
            SendMessageTimeout(progman, 0x052C, new IntPtr(0xD), IntPtr.Zero, 0, 1000, out res);
            SendMessageTimeout(progman, 0x052C, new IntPtr(0), IntPtr.Zero, 0, 1000, out res);

            IntPtr workerw = FindWindowEx(progman, IntPtr.Zero, "WorkerW", null);
            if (workerw == IntPtr.Zero) {
                EnumWindows((hWnd, lParam) => {
                    IntPtr shell = FindWindowEx(hWnd, IntPtr.Zero, "SHELLDLL_DefView", null);
                    if (shell != IntPtr.Zero) {
                        workerw = FindWindowEx(IntPtr.Zero, hWnd, "WorkerW", null);
                    }
                    return true;
                }, IntPtr.Zero);
            }

            IntPtr parent = workerw != IntPtr.Zero ? workerw : progman;

            int style = GetWindowLong(targetHwnd, GWL_STYLE);
            style = (style & ~WS_POPUP) | WS_CHILD;
            SetWindowLong(targetHwnd, GWL_STYLE, style);

            int exStyle = GetWindowLong(targetHwnd, GWL_EXSTYLE);
            exStyle = (exStyle | WS_EX_TOOLWINDOW) & ~WS_EX_APPWINDOW;
            SetWindowLong(targetHwnd, GWL_EXSTYLE, exStyle);

            SetParent(targetHwnd, parent);

            int w = GetSystemMetrics(0); // SM_CXSCREEN
            int h = GetSystemMetrics(1); // SM_CYSCREEN

            SetWindowPos(targetHwnd, HWND_BOTTOM, 0, 0, w, h, SWP_SHOWWINDOW | SWP_NOACTIVATE);
            Console.WriteLine("SUCCESS: Attached to " + parent + " (WorkerW: " + workerw + ")");
        } else if (action == "detach") {
            SetParent(targetHwnd, IntPtr.Zero);
            int style = GetWindowLong(targetHwnd, GWL_STYLE);
            style = (style & ~WS_CHILD) | WS_POPUP;
            SetWindowLong(targetHwnd, GWL_STYLE, style);
            Console.WriteLine("SUCCESS: Detached.");
        }
    }
}
