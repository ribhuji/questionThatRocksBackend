function deleteNull(obj) {
    for (var prop in obj) {
        if(typeof obj[prop] === 'object' && obj[prop] !== null){
            obj[prop] = deleteNull(obj[prop]);
            if(Object.keys(obj[prop]).length === 0){
                delete obj[prop];
            }
        }
        if (obj[prop] === null || obj[prop] === undefined || obj[prop] === 'null') { 
            delete obj[prop]; 
        } 
    }
    return obj;
};

module.exports = deleteNull;