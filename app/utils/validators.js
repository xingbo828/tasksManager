var validators = {
    notEmpty : function(val){
        return val !=='';
    },
    isEmail : function(email){
		var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
		return emailRegex.test(email);
    }
    
};

module.exports = validators;