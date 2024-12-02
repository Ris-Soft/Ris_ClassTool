#include <iostream>
#include <windows.h>
#include <urlmon.h>
#include <wininet.h>
#include <fstream>
#include <vector>
#include <string>

#pragma comment(lib, "wininet.lib")
#pragma comment(lib, "urlmon.lib")

using namespace std;


// 从URL下载文件
bool DownloadFile(const std::wstring& url, const std::wstring& filename) {
    HRESULT hr = URLDownloadToFile(NULL, url.c_str(), filename.c_str(), 0, NULL);
    return SUCCEEDED(hr);
}

// 启动进程
bool StartProcess(const std::wstring& exePath) {
    STARTUPINFO si;
    PROCESS_INFORMATION pi;
    ZeroMemory(&si, sizeof(si));
    si.cb = sizeof(si);
    ZeroMemory(&pi, sizeof(pi));

    if (!CreateProcess(NULL, (LPWSTR)exePath.c_str(), NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi)) {
        return false;
    }

    WaitForSingleObject(pi.hProcess, INFINITE);
    CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);

    return true;
}

static void PressKey(int key, bool press) {
    keybd_event(key, 0, press ? 0 : KEYEVENTF_KEYUP, 0);
}

static void KeyDown(int btn1, int btn2) { // 按下 {btn1} + {btn2} 键
    PressKey(btn1, true);
    PressKey(btn2, true);
    PressKey(btn2, false);
    PressKey(btn1, false);
}

int main(int argc, char* argv[]) {
    if (argv) {
        if (strcmp(argv[1], "keydown") == 0) {
            if (argc >= 3) {
                if (strcmp(argv[2], "desktop") == 0) {
                    KeyDown(VK_LWIN, 'D');
                }
                else if (strcmp(argv[2], "tasks") == 0) {
                    KeyDown(VK_LWIN, VK_TAB);
                }
                else if (strcmp(argv[2], "plugin") == 0 && argc >= 4) {
                    int key1 = atoi(argv[3]);
                    int key2 = atoi(argv[4]);
                    KeyDown(key1, key2);
                }
                else {
                    cout << "[Function>keydown]->ERROR:此功能不存在" << endl;
                }
            }
            else {
                cout << "[Function>keydown]->ERROR:参数数量错误" << endl;
            }
        }
        else if (strcmp(argv[1], "help") == 0) {
            cout << "[Function>Help]帮助：\n|function\n|-keydown [functionName(private)] . .\n|help[当前菜单]" << endl;
        }
        else {
            cout << "[Function]->ERROR:目标功能类不存在" << endl;
        }
    } 
    else {
        cout << "[Function]->ERROR:本功能程序需要带参运行" << endl;
    }

    return 0;
}