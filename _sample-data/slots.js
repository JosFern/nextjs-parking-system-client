const slots = [
    { number: 'S1', type: 0, position: [4, 5, 13], vehicle: null, status: 'available' },//
    { number: 'S2', type: 0, position: [5, 4, 12], vehicle: null, status: 'available' },//
    { number: 'S3', type: 0, position: [6, 3, 11], vehicle: null, status: 'available' },//
    { number: 'S4', type: 0, position: [7, 2, 10], vehicle: null, status: 'available' },
    { number: 'S5', type: 0, position: [8, 1, 9], vehicle: null, status: 'available' },
    { number: 'M6', type: 1, position: [9, 1, 8], vehicle: null, status: 'available' },
    { number: 'M7', type: 1, position: [10, 2, 7], vehicle: null, status: 'available' },
    { number: 'M8', type: 1, position: [11, 3, 6], vehicle: null, status: 'available' },
    { number: 'L9', type: 2, position: [12, 4, 5], vehicle: null, status: 'available' },
    { number: 'L10', type: 2, position: [13, 5, 4], vehicle: null, status: 'available' },
    // next row
    { number: 'S11', type: 0, position: [3, 6, 12], vehicle: null, status: 'available' },//
    { number: 'S12', type: 0, position: [4, 5, 11], vehicle: null, status: 'available' },//
    { number: 'S13', type: 0, position: [5, 4, 10], vehicle: null, status: 'available' },//
    { number: 'S14', type: 0, position: [6, 3, 9], vehicle: null, status: 'available' },
    { number: 'S15', type: 0, position: [7, 2, 8], vehicle: null, status: 'available' },
    { number: 'M16', type: 1, position: [8, 2, 7], vehicle: null, status: 'available' },
    { number: 'M17', type: 1, position: [9, 3, 6], vehicle: null, status: 'available' },
    { number: 'M18', type: 1, position: [10, 4, 5], vehicle: null, status: 'available' },
    { number: 'L19', type: 2, position: [11, 5, 4], vehicle: null, status: 'available' },
    { number: 'L20', type: 2, position: [12, 6, 3], vehicle: null, status: 'available' },
    // next row
    { number: 'S21', type: 0, position: [2, 7, 11], vehicle: null, status: 'available' },//
    { number: 'S22', type: 0, position: [3, 6, 10], vehicle: null, status: 'available' },//
    { number: 'S23', type: 0, position: [4, 5, 9], vehicle: null, status: 'available' },//
    { number: 'S24', type: 0, position: [5, 4, 8], vehicle: null, status: 'available' },
    { number: 'S25', type: 0, position: [6, 3, 7], vehicle: null, status: 'available' },
    { number: 'M26', type: 1, position: [7, 3, 6], vehicle: null, status: 'available' },
    { number: 'M27', type: 1, position: [8, 4, 5], vehicle: null, status: 'available' },
    { number: 'M28', type: 1, position: [9, 5, 4], vehicle: null, status: 'available' },
    { number: 'L29', type: 2, position: [10, 6, 3], vehicle: null, status: 'available' },
    { number: 'L30', type: 2, position: [11, 7, 2], vehicle: null, status: 'available' },
    // next row
    { number: 'S31', type: 0, position: [1, 8, 10], vehicle: 1, status: 'occupied' },//
    { number: 'S32', type: 0, position: [2, 7, 9], vehicle: null, status: 'available' },//
    { number: 'S33', type: 0, position: [3, 6, 8], vehicle: null, status: 'available' },//
    { number: 'S34', type: 0, position: [4, 5, 7], vehicle: null, status: 'available' },
    { number: 'S35', type: 0, position: [5, 4, 6], vehicle: null, status: 'available' },
    { number: 'M36', type: 1, position: [6, 4, 5], vehicle: null, status: 'available' },
    { number: 'M37', type: 1, position: [7, 5, 4], vehicle: null, status: 'available' },
    { number: 'M38', type: 1, position: [8, 6, 3], vehicle: null, status: 'available' },
    { number: 'L39', type: 2, position: [9, 7, 2], vehicle: null, status: 'available' },
    { number: 'L40', type: 2, position: [10, 8, 1], vehicle: null, status: 'available' },

    //----------------------------------------------

    { number: 'L41', type: 2, position: [1, 9, 10], vehicle: null, status: 'available' },//
    { number: 'L42', type: 2, position: [2, 8, 9], vehicle: null, status: 'available' },//
    { number: 'S43', type: 0, position: [3, 7, 8], vehicle: null, status: 'available' },//
    { number: 'S44', type: 0, position: [4, 6, 7], vehicle: null, status: 'available' },
    { number: 'S45', type: 0, position: [5, 5, 6], vehicle: null, status: 'available' },
    { number: 'M46', type: 1, position: [6, 5, 5], vehicle: null, status: 'available' },
    { number: 'M47', type: 1, position: [7, 6, 4], vehicle: null, status: 'available' },
    { number: 'S48', type: 0, position: [8, 7, 3], vehicle: null, status: 'available' },
    { number: 'L49', type: 2, position: [9, 8, 2], vehicle: null, status: 'available' },
    { number: 'L50', type: 2, position: [10, 9, 1], vehicle: null, status: 'available' },
    // next row
    { number: 'L51', type: 2, position: [2, 10, 11], vehicle: null, status: 'available' },//
    { number: 'L52', type: 2, position: [3, 9, 10], vehicle: null, status: 'available' },//
    { number: 'S53', type: 0, position: [4, 8, 9], vehicle: null, status: 'available' },//
    { number: 'S54', type: 0, position: [5, 7, 8], vehicle: null, status: 'available' },
    { number: 'S55', type: 0, position: [6, 6, 7], vehicle: null, status: 'available' },
    { number: 'M56', type: 1, position: [7, 6, 6], vehicle: null, status: 'available' },
    { number: 'M57', type: 1, position: [8, 7, 5], vehicle: null, status: 'available' },
    { number: 'S58', type: 0, position: [9, 8, 4], vehicle: null, status: 'available' },
    { number: 'L59', type: 2, position: [10, 9, 3], vehicle: null, status: 'available' },
    { number: 'L60', type: 2, position: [11, 10, 2], vehicle: null, status: 'available' },
    // next row
    { number: 'L61', type: 2, position: [3, 11, 12], vehicle: null, status: 'available' },//
    { number: 'L62', type: 2, position: [4, 10, 11], vehicle: null, status: 'available' },//
    { number: 'S63', type: 0, position: [5, 9, 10], vehicle: null, status: 'available' },//
    { number: 'S64', type: 0, position: [6, 8, 9], vehicle: null, status: 'available' },
    { number: 'S65', type: 0, position: [7, 7, 8], vehicle: null, status: 'available' },
    { number: 'M66', type: 1, position: [8, 7, 7], vehicle: null, status: 'available' },
    { number: 'M67', type: 1, position: [9, 8, 6], vehicle: null, status: 'available' },
    { number: 'S68', type: 0, position: [10, 9, 5], vehicle: null, status: 'available' },
    { number: 'L69', type: 2, position: [11, 10, 4], vehicle: null, status: 'available' },
    { number: 'L70', type: 2, position: [12, 11, 3], vehicle: null, status: 'available' },
    // next row
    { number: 'L71', type: 2, position: [4, 12, 13], vehicle: null, status: 'available' },//
    { number: 'L72', type: 2, position: [5, 11, 12], vehicle: null, status: 'available' },//
    { number: 'S73', type: 0, position: [6, 10, 11], vehicle: null, status: 'available' },//
    { number: 'S74', type: 0, position: [7, 9, 10], vehicle: null, status: 'available' },
    { number: 'S75', type: 0, position: [8, 8, 9], vehicle: null, status: 'available' },
    { number: 'M76', type: 1, position: [9, 8, 8], vehicle: null, status: 'available' },
    { number: 'M77', type: 1, position: [10, 9, 7], vehicle: null, status: 'available' },
    { number: 'S78', type: 0, position: [11, 10, 6], vehicle: null, status: 'available' },
    { number: 'L79', type: 2, position: [12, 11, 5], vehicle: null, status: 'available' },
    { number: 'L80', type: 2, position: [13, 12, 4], vehicle: null, status: 'available' },
]

export default slots