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
