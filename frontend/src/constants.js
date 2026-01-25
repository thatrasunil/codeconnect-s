export const SUPPORTED_LANGUAGES = [
    {
        id: 'javascript',
        name: 'JavaScript',
        template: `// Write your JavaScript code here\nconsole.log("Hello, World!");\n\nfunction main() {\n    // Your code goes here\n}\n\nmain();`
    },
    {
        id: 'python',
        name: 'Python',
        template: `# Write your Python code here\nprint("Hello, World!")\n\ndef main():\n    # Your code goes here\n    pass\n\nif __name__ == "__main__":\n    main()`
    },
    {
        id: 'c',
        name: 'C',
        template: `// Write your C code here
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`
    },
    {
        id: 'cpp',
        name: 'C++',
        template: `// Write your C++ code here
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`
    },
    {
        id: 'java',
        name: 'Java',
        template: `// Write your Java code here
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`
    },
    {
        id: 'go',
        name: 'Go',
        template: `// Write your Go code here
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`
    },
];

export const SUPPORTED_THEMES = [
    { id: 'vs-dark', name: 'Dark (Visual Studio)' },
    { id: 'vs', name: 'Light (Visual Studio)' },
    { id: 'hc-black', name: 'High Contrast' },
];

export const DEFAULT_EDITOR_SETTINGS = {
    fontSize: 14,
    wordWrap: 'off',
    lineNumbers: 'on',
    tabSize: 4,
    minimap: true,
    fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
    bracketPairColorization: true
};
