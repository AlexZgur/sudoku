//Print sudoku array (m)
function printMatrix(m, msg) {
    console.log(msg);
    m.forEach(element => console.log(element.join(' ')));    
}
//Print auxiliary array (m) with sudoku array (m2)
function printMatrix2(m, m2, msg) {
    console.log(msg);
    m.forEach((e, row) => {
        let r = '';
        for (let i = 0; i < e.length; i++) {
            if (e[i]) {
                r += '[' + Array.from(e[i]).join(' ') + ']\t';
            } else {
                r += m2[row][i] + '\t';
            }
        }
        console.log(r);
    });
}
//Compare auxiliary pairs for equality
function comparePairs(a, b) {
    let equal = true;
    if (a && b && a.size == b.size) {
        a.forEach(v => {
            if (!b.has(v)) equal = false;
        })
    } else {
        equal = false;
    }
    return equal;
}
//Recursive solver with some evristic helpers
function tryToSolve(matrix) {

    let digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let auxiliaryMatrix;
    let unResolvedCount;
    let matrixChanged;

    // Output only for debugging purposes    
    // printMatrix(matrix, 'initial');
    
    do {
        //Checking rules
        unResolvedCount = 0;
        auxiliaryMatrix = [];
        matrixChanged = false;
        for (let i = 0; i < 9; i++) {
            auxiliaryMatrix.push(new Array(9));
            let vi = matrix[i].reduce((s, v) => {
                s.delete(v);
                return s
            }, new Set(digits));
            if (vi.size > 0) {
                for (let j = 0; j < 9; j++) {
                    if (matrix[i][j] == 0) {
                        let vj = matrix.reduce((s, v) => {
                            s.delete(v[j]);
                            return s;
                        }, new Set(vi));
                        let r = Math.floor(i / 3) * 3;
                        let c = Math.floor(j / 3) * 3;
                        let vs = matrix.slice(r, r + 3).reduce((s, v) => v.slice(c, c + 3).reduce((s, v) => {
                            s.delete(v);
                            return s;
                        }, s), new Set(vj));
                        if (vs.size == 1) {
                            matrix[i][j] = vs.values().next().value;
                            vi.delete(matrix[i][j]);
                            matrixChanged = true;
                        } else if (vs.size > 1) {
                            auxiliaryMatrix[i][j] = vs;
                            unResolvedCount++;
                        } else {
                            return false;
                        }
                    }
                }
            }
        }

        //Output only for debugging purposes
        // printMatrix(matrix, 'rules check');
        // printMatrix2(auxiliaryMatrix, matrix, 'unresoved');        

        //Checking hidden
        if (unResolvedCount != 0 && !matrixChanged) {
            auxiliaryMatrix.forEach((er, i) => {
                er.forEach((e, j) => {
                    let vi = auxiliaryMatrix[i].reduce((s, v, col) => {
                        if (col != j) {
                            v.forEach(ve => s.delete(ve));
                        }
                        return s;
                    }, new Set(e));

                    let vr = auxiliaryMatrix.reduce((s, v, row) => {
                        if (row != i && v[j]) {
                            v[j].forEach(ve => s.delete(ve));
                        }
                        return s;
                    }, new Set(vi));
                    let r = Math.floor(i / 3) * 3;
                    let c = Math.floor(j / 3) * 3;
                    let vs = auxiliaryMatrix.slice(r, r + 3).reduce((s, v, row) => v.slice(c, c + 3).reduce((s, v, col) => {
                        if (row != i && col != j && v) {
                            v.forEach(ve => s.delete(ve));
                        }
                        return s;
                    }, s), new Set(vr));

                    if (vs.size == 1) {
                        let v = vs.values().next().value;
                        matrix[i][j] = v;
                        matrixChanged = true;
                    }
                });
            });
        }
        
        //Checking pairs columns
        if (unResolvedCount != 0 && !matrixChanged) {
            for (let col = 0; col < 9; col++) {
                let i = 0,
                    j, candidate;
                let found = false;
                while (i < 9 && !found) {
                    if (auxiliaryMatrix[i][col]) {
                        candidate = auxiliaryMatrix[i][col];
                        j = i + 1;
                        while (j < 9 && !found && candidate.size == 2) {
                            found = comparePairs(candidate, auxiliaryMatrix[j][col]);
                            if (!found) j++;
                        }
                    }
                    if (!found) i++;
                }
                if (found) {
                    for (let k = 0; k < 9; k++) {
                        if (k != i && k != j && auxiliaryMatrix[k][col]) {
                            candidate.forEach(e => auxiliaryMatrix[k][col].delete(e));
                            if (auxiliaryMatrix[k][col].size == 1) {
                                let v = auxiliaryMatrix[k][col].values().next().value;
                                matrix[k][col] = v;
                                matrixChanged = true;
                            }
                        }
                    }
                }
            }
        }
        
        //Checking pairs rows
        if (unResolvedCount != 0 && !matrixChanged) {
            for (let row = 0; row < 9; row++) {
                let i = 0,
                    j, candidate;
                let found = false;
                while (i < 9 && !found) {
                    if (auxiliaryMatrix[row][i]) {
                        candidate = auxiliaryMatrix[row][i];
                        j = i + 1;
                        while (j < 9 && !found && candidate.size == 2) {
                            found = comparePairs(candidate, auxiliaryMatrix[row][j]);
                            if (!found) j++;
                        }
                    }
                    if (!found) i++;
                }
                if (found) {
                    for (let k = 0; k < 9; k++) {
                        if (k != i && k != j && auxiliaryMatrix[row][k]) {
                            candidate.forEach(e => auxiliaryMatrix[row][k].delete(e));
                            if (auxiliaryMatrix[row][k].size == 1) {
                                let v = auxiliaryMatrix[row][k].values().next().value;
                                matrix[row][k] = v;
                                matrixChanged = true;
                            }
                        }
                    }
                }
            }
        }

        //Output only for debugging purposes
        // printMatrix2(auxiliaryMatrix, matrix, 'after helpers');
        
        //No more ideas, trying to guess
        if (unResolvedCount != 0 && !matrixChanged) {
            let guessElement = auxiliaryMatrix.reduce((a, v, i) => a.concat(v.reduce((b, k, j) => b.concat([[[...k], i, j]]), [])), []);
            guessElement = guessElement.sort((a, b) => a[0].length - b[0].length)[0];
            let guessNo = 0;
            let guessResult;
            while (guessNo<guessElement[0].length) {
                matrix[guessElement[1]][guessElement[2]]=guessElement[0][guessNo];
                guessResult = tryToSolve(matrix.map(r => [...r]));
                if (guessResult) {
                    return guessResult;
                } 
                guessNo++;
            }
        }
    } while (unResolvedCount != 0 && matrixChanged);
    if (unResolvedCount!=0) {
        matrix=false;
    }
    return matrix;

}

module.exports = function solveSudoku(matrix) {
    // your solution
    return tryToSolve(matrix);
}