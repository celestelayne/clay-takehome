const cheerio = require("cheerio");
const axios = require('axios');
const prompt = require('prompt-sync')({sigint: true});

const data = {
    basic: {
        firstName: "",
        lastName: "",
        company: ""
    },
    formula: {
        "Google Search Input": "",
        "LinkedIn URL": "",
    },
    api: {
        "Google Search": "",
        "LinkedIn Data": "",
    }
}

/*
    This formula should be able to run google search and linkedin lookup
    */ 
    async function evaluateFormula(formulaString, inputs) {

    console.log('Line 27', formulaString) // linkedin.com+ann+curry
    console.log('Line 28', inputs) // { 'First Name': 'ann', 'Last Name': 'curry', 'Company Name': 'clay' }

    try {
        let urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()\/\/]*)/
        const url = `https://www.google.com/search?q=${formulaString}&gl=us&hl=en`
        console.log(url) // this works
        // Fetch the HTML content from the URL
        const response = await axios.get(url)
        // Load the HTML content into Cheerio
        const $ = cheerio.load(response.data)
        // select the anchor tags
        const search = $("a");
        console.log(search.length) // 31

        const results = [];
        search.each((i, el) => {
            results.push({
                text: $(el).text(),
                href: $(el).attr('href')
            })
        })
        results.forEach(el => {
            console.log(el)
            if(el.text.includes(`${inputs["First Name"]} ${inputs["Last Name"]} - ${inputs["Company Name"]}`)){
                // match the href against the regex pattern
                let parsedUrl = el.href.match(urlPattern)[0]
                console.log(parsedUrl) // https://www.linkedin.com/in/kareemamin
                axios.get(parsedUrl)
                    .then(response => {
                        console.log(response.data);
                        // console.log(response.data.explanation);
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } else {
                console.log('not found')
            }
        })
    } catch (error) {
        console.error(error);
    }

}

const questions = ["What is your first name?", "What is your last name?", "What is your company name?"]
const columnNames = ["First Name", "Last Name", "Company Name", "Google Search Input", "Google Search", "LinkedIn URL", "LinkedIn Data"]

/*
    updatedCell - new value of a cell that was updated in the UI by the user, [string]
    rowData - object containing the data of all the cells in the row prior to the cell update, [object]
    columns - the workflow (columns) that have already been created
*/

function runWorkflowForRow(updatedCell, rowData, columns){
    let rowId = 0

    for (const [key, value] of Object.entries(data)) {
        if (key === 'basic') {
            for (var i = 0; i < questions.length; i++) {
                updatedCell = prompt(questions[i]); // Celeste
                console.log(`Hello ${updatedCell}`);
                rowData[columns[i]] = updatedCell
            }
        } else if(key === 'formula'){
            // console.log(key, value)
            return evaluateFormula(`linkedin.com+${rowData["First Name"]}+${rowData["Last Name"]}`, rowData)
        } else if (key === 'api'){
            console.log(key, value)
        }
    }


    console.log(rowData)
    /*
    {
        'First Name': 'celeste',
        'Last Name': 'layne',
        'Company Name': 'clay'
    }
    */
    refreshUI(rowId, rowData)
}

// this function should print out the updated values to the console
function refreshUI(rowId, rowData){
    console.log('Updated values to each row: ', rowId, rowData)
}

async function main(){
    await runWorkflowForRow(questions, {}, columnNames) // fills in first name
}

main()
