#include <iostream>
#include <windows.h>

using namespace std;


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