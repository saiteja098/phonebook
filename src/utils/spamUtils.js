//use sigmoid function to normalize the weighted sum to 0 - 1
const normalize = (weightedSum) => {
    return 1 / (1 + Math.exp(-weightedSum)); //sigmoid function to normalize
}

const calculateLikelyhood = (totalVotes) => {
    // Normalize the result to be in the range of 0 to 1
    const spamLikelihood = normalize(-4.4 + totalVotes*0.01); //for hundered totalvotes, its becomes ~0.032

    return Math.floor(spamLikelihood*1000); //0.032*1000 = 32%
}

module.exports = {
    calculateLikelyhood
}