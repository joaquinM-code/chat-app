const generateMessage = (text, user)=>{
    return{
        text,
        user,
        createdAt: new Date().getTime(),
    }
}

//data sanitization 

const encodeHTML = (userInput)=> {
    return userInput.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

module.exports = {
    generateMessage,
    encodeHTML
}