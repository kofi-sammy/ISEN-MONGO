const mongoose = require("mongoose");
const axios = require("axios");
const Schema = mongoose.Schema;

// ================Database connection=====================
async function dataBaseConnect() {
    try {
        await mongoose.connect("mongodb+srv://mongodb_Project:Homework1234@cluster0.emwgskr.mongodb.net/?retryWrites=true&w=majority")
        console.log("Database Connected....")
    }
    catch (error) {
        console.log("Failed connection", error)
    }
}
const db = dataBaseConnect()

// ================Getting Vlille=====================
const getVlille = async () => {
    await axios("https://opendata.lillemetropole.fr/api/records/1.0/search/?dataset=vlille-realtime&q=&rows=3000&facet=libelle&facet=nom&facet=commune&facet=etat&facet=type&facet=etatconnexion", {
        method: "GET",
    }).then(function (res) {
        // =========== get records =============
        let records = res.data.records
        console.log('records ===>', records)
        // map data to given parameters 
        records.map((items, i) => {
            let insertVlille = {
                '_id': items.fields.libelle,
                'name': items.fields.nom,
                'geometry': items.geometry,
                'size': items.fields.nbvelosdispo + items.fields.nbplacesdispo,
                'source': {
                    'dataset': 'Lille',
                    'id_ext': items.fields.libelle,
                    'tpe': items.fields.type === 'AVEC TPE' ? items.fields.type : null
                }
            }
        })  
            console.log(`data ${i}`, insertVlille)
          var userSchema = new Schema({
                _id:Number,
                name:String,
                geometry:Object,
                size:Number,
                source:Object
             });

             const Station = mongoose.models.Station || mongoose.model('Station', userSchema);

            Station.insertMany(insertVlille).then(function () {
                console.log("Data inserted Succesfully ")  // Success
            }).catch(function (error) {
                console.log('Insert Error =====> ',error) // Failure
            });
        })
        
        const updateStationArea = new Schema({
            station_area: String
        })
        const updateStationAreaData = mongoose.models.Station || mongoose.model('updateStationAreaData', updateStationArea);
        
         let datas = {"station_area": "deactivate", }
        
        updateStationAreaData.insert(datas).then(function () {
            console.log("Data inserted Succesfully ")  // Success
        }).catch(function (error) {
            console.log('Insert Error =====> ',error) // Failure
        })


        var updateSchema = new Schema({
            bike_availbale:Number,
            stand_availbale:Number,
            date:Date,
            station_id:Number
         });

         const UpdateDatas = mongoose.models.Station || mongoose.model('UpdateDatas', updateSchema);
        // == == == == == == updates == == == == == == == ==
        for (let index = 0; index === 0; index++) {
            setTimeout(() => {
                records.map((items, i) => {
                    let datas = [
                        {
                            "bike_availbale": items.fields.nbvelosdispo,
                            "stand_availbale": items.fields.nbplacesdispo,
                            "date": new Date(items.fields.datemiseajour),
                            "station_id": items.fields.libelle
                        }
                    ]
                    console.log(`Realtime DATABASE ${i} in 10 seconds:`, datas)
        
                    UpdateDatas.insertMany(datas).then(function () {
                        console.log("Update Data inserted Succesfully ")  // Success
                    }).catch(function (error) {
                        console.log('Update  Error =====> ',error) // Failure
                    });

                    datas.map(data => {
                        UpdateDatas.updateOne(data, function (err, docs) {
                            if (err){
                                console.log('error from updates ===>',err)
                            }
                            else{
                                console.log("Updated Docs : ", docs);
                            }
                        });
                    })
                })
            }, 10000)
        }

        //=============  Client Program =================
        records.map((items, i) => {
            let clientData = {
                "station_name": items.fields.nom,
                "last_data": {
                    "bikes": items.fields.nbvelosdispo,
                    "stands": items.fields.nbplacesdispo
                },
                lat: items.fields.geo[0],
                long: items.fields.geo[1]
            }
            console.log('Client Programe Data ==> ', clientData)
        })

        // =============  update a station =================
         const Station = mongoose.models.Station || mongoose.model('Station', userSchema);
        records.map((items, i) => {
             Station.findOneAndUpdate({_id: items.fields.libelle  }, function (err, docs) {
            if (err){
                console.log(err)
            }
            else{
                console.log("update User : ", docs);
            }
        
        });
    })
        // ============= find a station =================
        
        Station.find({ name: { $regex: "s", $options: "i" } }, function(err, docs) {console.log(docs); });
    
}

getVlille()