'use strict';
var async = require("async");
module.exports = function(Session) {

    Session.remoteMethod("getOfficeInfo", {
        http: {
            path: "/getOfficeInfo",
            verb: "GET"
        },
        description: "Handle a request to join Offices to Appointments",
        accepts: [{
            arg: 'req',
            type: 'object',
            'http': {
                source: 'req'
            }
        }, {
            arg: 'res',
            type: 'object',
            'http': {
                source: 'res'
            }
        }],
        returns: {
            type: 'object',
            root: true
        }
    });

    // "0.0.0.0/api/FirmUser/getType?filter[where][firmId]=12ab"
    // ""... /FirmUser/getType?filter[where][firmId]=" + firmId
    /*
    req.query.filter = {
        where: {
            firmId: 12ab
        }
    }
    */

    Session.getOfficeInfo = function(req, res, cb) {
        //so we need to make sure the argument is put into this function (req)
        // resp = from the model that we are using = (AppUsers)
        //cb = callback and what you want to get out of the callback


        //will be using the FirmUser model so we use a variable (FirmUser) to refer to it
        var Office = Session.app.models.Office;

        //     // console.log()

        // "0.0.0.0/api/FirmUser/getType?filter[where][firmId]=12ab"
        // ""... /FirmUser/getType?filter[where][firmId]=" + firmId
        /*
        req.query.filter = {
            where: {
                firmId: 12ab
            }
        }
        */
        //req.query.filter = this is where the information within the AppUser is at!
        Session.find(req.query.filter, function(err, resp) {
            if (err) {
                return cb(err);
            }
            //async method because you want to make sure that while we get the info from FirmUser 
            async.forEachOf(resp, function(index, i, next) {
                //FirmUser = variable that refers to the FirmUser model
                //findOne is the method
                Office.findOne({
                    where: {
                        //index refers to the AppUser property that we are using to refer it to Firm User
                        //userId is property within FirmUser                                
                        id: index.officeId
                    }
                }, function(officeError, OfficeResp) {
                    if (officeError) {
                        next(officeError);
                    }
                    else {
                        //the property that we are creating within AppUser (resp = refers to AppUser you can look above)
                        //firmResp is the object response from hitting the FirmUser model
                        resp[i].OfficeInfo = OfficeResp;
                        next();
                    }
                });
            }, function(err) {
                if (err) {
                    //errors
                    var error = new Error('async.forEach operation');
                    error.statusCode = 500;
                    cb(error);
                }
                else {
                    //callback = what you want to get back when this whole method finishes
                    //resp = refers to everything within AppUser (The Whole Object)
                    cb(null, resp);
                }
            });
        });


    };
};