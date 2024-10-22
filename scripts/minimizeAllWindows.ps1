Add-Type @"
using System;
using System.Runtime.InteropServices;
public class User32 {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, int dwExtraInfo);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@
$VK_LWIN = 0x5B
$VK_M = 0x4D
[User32]::keybd_event($VK_LWIN, 0, 0, 0)
[User32]::keybd_event($VK_M, 0, 0, 0)
[User32]::keybd_event($VK_M, 0, 2, 0)
[User32]::keybd_event($VK_LWIN, 0, 2, 0)