import natural from "natural";
import stopword from "stopword";

// For conversion of contractions to standard lexicon 
const wordDict:Record<string, string> = { 
    "aren't": "are not", 
    "can't": "cannot", 
    "couldn't": "could not", 
    "didn't": "did not", 
    "doesn't": "does not", 
    "don't": "do not", 
    "hadn't": "had not", 
    "hasn't": "has not", 
    "haven't": "have not", 
    "he'd": "he would", 
    "he'll": "he will", 
    "he's": "he is", 
    "i'd": "I had", 
    "i'll": "I will", 
    "i'm": "I am", 
    "isn't": "is not", 
    "it's": "it is", 
    "it'll": "it will", 
    "i've": "I have", 
    "let's": "let us", 
    "mightn't": "might not", 
    "mustn't": "must not", 
    "shan't": "shall not", 
    "she'd": "she would", 
    "she'll": "she will", 
    "she's": "she is", 
    "shouldn't": "should not", 
    "should've": "should have",
    "that's": "that is", 
    "there's": "there is", 
    "they'd": "they would", 
    "they'll": "they will", 
    "they're": "they are", 
    "they've": "they have", 
    "we'd": "we would", 
    "we're": "we are", 
    "weren't": "were not", 
    "we've": "we have", 
    "what'll": "what will", 
    "what're": "what are", 
    "what's": "what is", 
    "what've": "what have", 
    "where's": "where is", 
    "who'd": "who would", 
    "who'll": "who will", 
    "who're": "who are", 
    "who's": "who is", 
    "who've": "who have", 
    "won't": "will not", 
    "wouldn't": "would not", 
    "would've": "would have",
    "you'd": "you would", 
    "you'll": "you will", 
    "you're": "you are", 
    "you've": "you have", 
    "'re": " are", 
    "wasn't": "was not", 
    "we'll": " will"
} 

export const processEvent = (text:string) => {

    let event = convertToStandard(text);
     // Tokenization 
    const tokenConstructor = new natural.WordTokenizer(); 
    const tokenizedData = tokenConstructor.tokenize(event); 
    // Remove Stopwords 
    const filteredData = stopword.removeStopwords(tokenizedData); 
    const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    const analysis_score = analyzer.getSentiment(filteredData); 
    //event = event + " => " + analysis_score;
    return analysis_score;
}

const convertToStandard = (text: string) => {
    const data = text.split(' ');
    return data.map(word => {
        // replace all non alphabets with empty string.
        const alpha = word.replace(/[^a-zA-Z\s]+/g, '');
        if(alpha.length < 1){
            return alpha;
        }
        const lowerWord = alpha.toLowerCase();
        return wordDict[lowerWord] || lowerWord;
    }).join(' ');
};
  
