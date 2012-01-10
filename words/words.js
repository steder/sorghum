/* Words.js */

var penzilla = {};
penzilla.words = {};
penzilla.words.db = undefined;
penzilla.words.EndOfWord = true;
penzilla.words.Trie = function () {
    var self = this;
    self.data = {};
};

penzilla.words.Trie.prototype.insertWord = function(word) {
    var self = this;
    var trie = self.data;
    for (var i = 0; i < word.length; i++) {
        var character = word[i];
        if (trie[character] === undefined){
            if (i == (word.length - 1)) {
                trie[character] = {"EOW":penzilla.words.EndOfWord,
                                   "PROPER":Boolean(word[0] == word[0].toUpperCase())};
            }
            else {
                trie[character] = {"EOW":false};
            }
        }
        trie = trie[character];
    }
};

function loadWords() {
    // load the trie
    var trie = new penzilla.words.Trie();
    penzilla.words.db = trie;
    //for (var i = 0; i < WORDS.length; i++) {
    for (var i = 0; i < WORDS.length; i++) {
        console.log("inserting word: " + WORDS[i]);
        trie.insertWord(WORDS[i]);
    }
};

function findWords() {
    // pull the word out of the letters field
    var letters = document.getElementById("letters");
    console.log("Letters: " + letters.value);
};