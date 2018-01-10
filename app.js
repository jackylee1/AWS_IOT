var awsIot = require('aws-iot-device-sdk');
var fs=require("fs");
var AWS=require('aws-sdk');
//
//declear varialbs
var heartbeat= 20; //fake data
var pushbutton = true;

var SOS = {
    "help" : 1,
    "Location" : "SJSU",
    "Msg": "I am drunk"
};

var HospitalInfo={
    "Name":"IoT3",
    "Time":1200,
    "Msg": "I usually have heart attack",
    "Location":"FromNodeJS",
    "Medical_Report_URL": " "
};

var Medical_Info ={
    "Name":"Jay",
    "Other_Info":"This is uploaded from IoT Rules and Python",
    "Medical_Report_URL": "fda"
};


// Inistalize Device
var device = awsIot.device({
    keyPath: '/Users/jz/WebstormProjects/AWS_IOT/f86139fd83-private.pem.key',
    certPath: '/Users/jz/WebstormProjects/AWS_IOT/f86139fd83-certificate.pem.crt',
    caPath: 'VeriSign.pem',
    clientId: 'Pump1',
    host:'a1s6u9kqjd43mc.iot.us-west-2.amazonaws.com'
});

function decode(URL){
    var uri_dec = decodeURIComponent(URL);
}


function getURL() {
    var s3 = new AWS.S3();
    const params2 = { Bucket: 'cmpe189',  Key: 'MedicalFile/Medical_Info2.txt'};
    var URL = s3.getSignedUrl('getObject', params2);
    console.log("The URL is : ", URL, "\n");
    return URL;
}


//Direct upload file to S3 from Method 1
fs.readFile('Medical_Info2.txt', function (err, data) {
    if (err) {
        throw err;
    }

    var base64data = new Buffer(data, 'binary');
    var s3 = new AWS.S3();

    const params1 = { Bucket: 'cmpe189',
        Key: 'MedicalFile/Medical_Info3.txt',
        Body: base64data,
        ACL: 'public-read'};

     s3.putObject(params1, function(){
         console.log("REPORT upload sucessed");
     });

    HospitalInfo.Medical_Report_URL = getURL();
});

//Send a seriel msg to Aws IoT
if(heartbeat <= 20 || pushbutton) {
// Test Mqtt and trigger the rules for BD ,S3 , SNS
    device
        .on('connect', function () {
            console.log('connected');
            //device.subscribe('NodeTopicSub');
            device.publish('sendsms/sos', JSON.stringify(SOS));
            console.log("SMSed to 911");
            device.publish('File', JSON.stringify(Medical_Info));
            console.log("msg sent and saved in S3 \n");
            device.publish('hospital/info', JSON.stringify(HospitalInfo));
            console.log("Msg pushed to DB");
        });
}