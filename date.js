
function getday(){
    const today = new Date();

    var options = {
        weekday:"long",
        month:"long",
        year:"numeric",
        day:"numeric"
    }
    
    const day = today.toLocaleDateString("en-US", options);

    return day;
}

module.exports = {
    getday : getday
};
