export function convertToTitleCase(text: string, wordBoundaryChars: string[], ignore: string[]): string {
    // Add space and tab to wordBoundaryChars
    wordBoundaryChars.push(" ", "\t");

    let transformed = "";
    let word = "";
    // Iterate the characters and build each word
    for (const char of text) {
        if (wordBoundaryChars.includes(char)) {
            // push 'word' to 'transformed'
            transformed += convertWord(word, ignore);
            // push 'char' to 'transformed'
            transformed += char;
            // clear 'word'
            word = "";
        } else {
            // push 'char' to 'word'
            word += char;
        }
    }
    // Push 'word' one last time
    transformed += convertWord(word, ignore);

    return transformed;
}

function convertWord(word: string, ignore: string[]): string {
    if (word.length > 0) {
        // convert to lowercase
        word = word.toLocaleLowerCase();
        // only capitalize if not in 'ignore' list
        if (!ignore.includes(word)) {
            word = word[0].toLocaleUpperCase() + word.slice(1);
        }
    }
    return word;
}
