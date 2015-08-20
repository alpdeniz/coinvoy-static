window.translations = {};
window.messages = {
	"common": {
		"password": "Password",
		"login": "Login",
		"invalidEmail": "Please enter a valid email address.",//"Email is not valid. Please type in a correct email."
		"emailSent": "An email has been sent to your mailbox.",
		"error": "An error occurred. Sorry, it won't happen again.",
		"wallet": "Wallet",
	},
	"main": {
		"wallet": "Wallet",
		"about": "About",
		"home": "Home",
		"merchants": "Merchants",
		"personal": "Personal",
		"register": "Sign Up",
		"register2": "SIGN UP",
		"account": "Account",
		"password": "Password",
		"register": "Sign Up",
		"forgotPass": "Forgot Password?",
		"login": "Login",
		"loginSuccess": "Login successful!",
		"loginFail": "Wrong email/password combination. Please re-enter your password.",
		"mailPlaceholder": "Your Email",
		"passPlaceholder": "Your Password",
		"logout": "Log out",
		"banner": "COINVOY",
	},
	"landing": {
		//"slogan": "Decentralized, maximum security wallet for all!",
		"slogan" : "designed for the love of Bitcoin",
		"slogan2": "This wallet is yours, fully yours. And it is never lost.",
		"slogan3": "Funds are secured by mathematics. Not by us.",
		"password": "Password",
		"register": "Sign Up",
		"register2": "SIGN UP",
		"mailPlaceholder": "Type your email",
		"passPlaceholder": "Type a password",
		"forgotPass": "Forgot Password?",
		"login": "Login",
		"recoverWallet": "Recover Wallet",
		"alreadyRegistered": "Email is already registered.",
		"passwordComplexity": "Password is not strong enough.",
	},
	"wallet": {
		tx: {
			amount: "Transaction Amount",
			id: "Transaction ID",
			date: "Transaction Time",
			fee: "Transaction Fee",
			confirmed: "confirmed",
			outgoing: "Outgoing",
			incoming: "Incoming",
		},
		"transactionRecords": "Transaction Records",
		"unconfirmed": "Unconfirmed",
		"confirmedTx": "This transaction is not confirmed yet.",
		"transactedAmount": "Transacted Amount",
		"transactionTime": "Time",
		"transactionFee": "Transaction Fee",
		"transactionID": "Transaction ID",
		"walletHeader": "Your WALLET",
		"total": "Total",
		"buy": "Buy",
		"sell": "Sell",
		"send": "Send",
		"sendTo": "Send To",
		"sendToPlaceholder": "E-mail or Bitcoin address to send",
		"wrongPIN": "Wrong PIN. Try again...",
		"sendingTx": "Sending...",
		"txSuccess": "Successfully sent!",
		"txFail": "Sorry. Couldn't send.",
		"invalidAmount": "Invalid amount or address.",
		"enterPIN": "Enter your PIN",
		"sendPIN": "Send Now",
		"wallet": "Wallet",
		"receive": "Receive",
		"settings": "Settings"
	},
	"account": {
		"recoverPIN": "Recover Wallet PIN",
		"changePass": "Change Password",
		"changeBtn": "Change",
		"registerExchange": "Register for Exchange",
		"addresses": "Addresses",
		"oldPass": "Old Password",
		"newPass": "New Password",
	},
	"about": {
		"text1": "Coinvoy Wallet© grants you the freedom to securely own your Bitcoin wallet.",
		"text2": "Store your bitcoins in the most secure framework.",
		"text3": "Buy/Sell instantly.",
		"text4": "Send easily to your friends.",
		"text5": ""//"Coinvoy Wallet© is made by the Coinvoy team, one of the best Bitcoin technology developer teams in the World.",
	},
	"recoverPIN": {
		"recoverBtn": "Recover PIN",
		"pinIsBack": "Your PIN is back!!",
		"pinIsNotBack": "Please correct your secret answers.",
		"importantNotice": "Important Notice! ",
		"notice": "Notice: ",
		"importantNoticeText": "Please do not forget your PIN.",
		"noticeText": "Your information stays only in your browser. It is never sent to anywhere. ",
	},
	"registerKYC": {
		"title": "Register for Exchange (KYC)",
		"fullName": "Full Name",
		"fullNamePlaceholder": "Your Full Name",
		"uploadDocs": "Upload Documents",
		"merchInfo": "Merchant Information",
	},
	"questions": [
        {
            label: "Question 1",
            options: [
                "Select a question",
                "What is the first name of the boy or girl that you first kissed?",
                "What is the middle name of your oldest child?",
                "What is the name of your favorite childhood friend?",
                "What is your mother's maiden name?",
            ],
            selection: "",
            value: "",
        },
        {
            label: "Question 2",
            options: [
                "Select a question",
                "What are the last five digits of your driver's licence number?",
                "What are the last five digits of your ID document number?",
                "Where were you when you first heard about 9/11?",
                "Other"
            ],
            selection: "",
            value: "",
        },
        {
            label: "Question 3",
            options: [
                "Select a question",
                "In what city or town was your first job?",
                "In what city or town did your mother and father meet?",
                "Other"
            ],
            selection: "",
            value: "",
        }
    ],
};

String.prototype.translate = function (){

	var enStr = this.toString();

	if(!enStr) return "";
	if(!window.language) return enStr;

	var languages = ['TR'];
	var translations = window.translations;

	if(languages.indexOf(window.language) >= 0) {
		if(translations[window.language] && translations[window.language][enStr])
			return translations[window.language][enStr].toString();
		else
			return enStr.toString();
	}

	return enStr.toString();
}