const Menu =
{
    showOptions()
	{
	    console.log(
			`Options\tDescription
-LC\tList all categories for eBooks
`
		)
	},

	takeInput()
	{
		return process.argv.slice( 2 )
	}
}

module.exports = Menu
