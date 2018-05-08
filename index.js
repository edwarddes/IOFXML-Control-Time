'use strict';
var $ = require('cheerio');
var fs = require('fs');
var moment = require('moment');
var stringify = require('csv-stringify');


var resultsFile = "./xml/splits.xml";
var outputFile = "./punchTimes.csv";

var controlNumber = 100;


var parseResultsList = function(xml)
{
	var data = [];
	$(xml).find('ClassResult').each(function()
	{
		var className = $(this).find('Class > Name').text();
		//console.log(className);
		$(this).find('PersonResult').each(function()
		{
			var lastName;
			var firstName;
			
			$(this).find('Person').each(function()
			{
				lastName = $(this).find('Family').text();
				firstName = $(this).find('Given').text();
			});
			
			var bibNumber;
							
			$(this).find('Result').each(function()
			{
				var starttime = moment($(this).find('StartTime').text(),"YYYY-MM-DDThh:mm:ss.SSS");
				
				bibNumber = $(this).find('BibNumber').text();
				var startNumber = $(this).find('StartNumber').text();
				if(bibNumber == "")
					bibNumber = startNumber;
				
				var splits = new Array();	
				$(this).find('SplitTime').each(function()
				{
					var code = $(this).find('ControlCode').text();
					var splitTime = $(this).find('Time').text();
					var splitRunningTime = undefined;
					if(splitTime != "")
						splitRunningTime = moment(starttime).add(parseInt(splitTime),"seconds");
					if(parseInt(code) == controlNumber)
					{
						if(splitRunningTime != null)
						{
							data.push([lastName,firstName,bibNumber,splitRunningTime.format('HH:mm:ss')]);
						}
						else
						{
							data.push([lastName,firstName,bibNumber,""]);
						}
					}
				});
				
			});
		});
	});

	var columns = 
	{
		lastName: 'lastName',
		firstName: 'firstName',
		bib: 'bib',
		punchTime: 'punchTime'
	};
	stringify(data, { header: true, columns: columns }, function(err, output){
		fs.writeFileSync(outputFile,output); 
	});
	
	
}

parseResultsList(fs.readFileSync(resultsFile,'utf8'));