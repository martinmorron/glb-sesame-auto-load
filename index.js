const puppeteer = require('puppeteer');
const jsonfile = require('jsonfile');
const configFile = 'config/config.json';

(async () => { 

    var configuration

    jsonfile.readFile(configFile)
            .then(obj => configuration = obj)
            .catch(error => {
                console.error("Config file not found. Add config/config.json to continue")
                process.exit()
            })
                    
    const today = formattedToday()
    const browser = await puppeteer.launch() 
    const page = await browser.newPage() 
    await page.goto('https://panel.sesametime.com/')
    //start login
    await page.type('#UserEmail', configuration.user)
    await page.type('#UserPassword', configuration.password)
    const [loginResponse] = await Promise.all([page.waitForNavigation(), page.click('[type="submit"]')])
    //end login

    //open load hours
    await page.goto('https://panel.sesametime.com/admin/checks/show_check_request')
    await page.evaluate( () => document.querySelector('#CheckDate').value = "")
    await page.type('#CheckDate', `${today} 09:00:00`)
    
    await page.evaluate(() => {
        document.querySelector('#CheckAddExitCheck').click()
      })

    await page.evaluate(() => {
        document.querySelector('#add_exit_check').setAttribute('style', 'display: block')
    })

    await page.evaluate( () => document.querySelector('#CheckExitDate').value = "")
    await page.type('#CheckExitDate', `${today} 18:00:00`)
    if(!configuration.debug){
        //const [loadResponse] = await Promise.all([page.waitForNavigation(), page.click('#buttonSendEditCheck')])
        console.log("OH NO, OH NO");
    }
    //end load hours

    await page.screenshot({ path: 'GFG.png' }) 
    console.log("Done")
    await browser.close() 
})()

function formattedToday() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear()

    if (month.length < 2) 
        month = '0' + month
    if (day.length < 2) 
        day = '0' + day

    return [year, month, day].join('-')
}