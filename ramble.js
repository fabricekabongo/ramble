var Map = require('hashmap');

function Ramble() {
    this.similarityDistance = function(pref, person1, person2) {
        var squares = 0;
        for (var item in pref[person1]) {
            if (pref[person1].hasOwnProperty(item) && pref[person2].hasOwnProperty(item)) {
                squares += Math.pow(pref[person1][item] - pref[person2][item], 2);
            }
        }

        return 1/(1+squares);
    }

    this.similarityPearson = function(pref, person1, person2) {
        si = 0;
        sum1 = 0;
        sum2 = 0;
        sum1sq = 0;
        sum2sq = 0;
        pSum = 0;
        for (var item in pref[person1]) {
            if (pref[person1].hasOwnProperty(item) && pref[person2].hasOwnProperty(item)) {
                si++;
                sum1 += pref[person1][item];
                sum2 += pref[person2][item];
                sum1sq += Math.pow(pref[person1][item], 2);
                sum2sq += Math.pow(pref[person2][item], 2);
                pSum += pref[person1][item] * pref[person2][item];
            }
        }

        num = pSum - (sum1 * sum2 / si);
        den = Math.sqrt((sum1sq - Math.pow (sum1, 2)/si)*(sum2sq - Math.pow(sum2, 2)/si));

        return den == 0? 0: num/den;
    }

    this.topMatches = function(pref, person, n=5, similarity = this.similarityPearson) {
        var scores = [] ;
        for (var other in pref) {
            if (other !== person) {
                scores.push([other, similarity(pref, person, other)]);
            }
        }
        this.sortEntries(scores);

        return scores.splice(0, n);
    }

    this.sortEntries = function(entries) {
        for (var i = 0; i < entries.length; i++) {
            for (var y = 0; y < entries.length; y++) {
                if (entries[i][1] > entries[y][1]) {
                    a = entries[i];
                    entries[i] = entries[y];
                    entries[y] = a;
                }
            }
        }
    }

    this.getRecommendations = function(pref, person, similarity = this.similarityPearson) {
        totals = new Map();
        simSums = new Map();

        for (var other in pref) {
            if (pref.hasOwnProperty(other) && other !== person) {
                sim = similarity(pref, person, other);
                if (sim > 0) {
                    for (var item in pref[other]) {
                        if (pref[other].hasOwnProperty(item) && (!pref[person].hasOwnProperty(item) || pref[person][item] == 0)) {
                            if (!totals.has(item)) {
                                totals.set(item, 0);
                            }
                            var u = totals.get(item);
                            u += pref[other][item] * sim;
                            totals.set(item, u);
                            if (simSums.has(item)) {
                                simSums.set(item, 0);
                            }
                            p = simSums.get(item);
                            p += sim;
                            simSums.set(item, p);
                        }
                    }
                }
            }
        }

        iterator = totals.entries();
        rankings = [];

        do {
            item = iterator.next();
            if (!item.done) {
                rankings.push([item.value[0], item.value[1]/simSums.get(item.value[0])]);
            }
        } while(!item.done);

        this.sortEntries(rankings);

        return rankings;
    }

}

module.exports = Ramble;
