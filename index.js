const express = require('express') ;
const mysql = require('mysql2') ;
const app = express() ;
const port = 3000 ;

app.use(express.json()) ;

const db = mysql.createConnection({
    host : 'localhost' ,
    database : 'gestion_reservation' ,
    user : 'root' ,
    password : ''
})

db.connect((err) => {
    if(err){
        console.error('Error connecting to mysql: ', err.message);
        return;
    }
});

/// I. Requêtes CRUD de base (Rappel)



/// 1.	Implémentez les routes CRUD pour les clients.

//// index : 

app.get('/clients' , (req , res)=> {
    db.query('SELECT * FROM clients' , (err , result) => {
        if(err) throw err ;
        res.json(result) ;
    }) ;
}) ;

//// show :

app.get('/clients/:id' , (req , res)=> {
    const {id} = req.body ;
    db.query('SELECT * FROM clients WHERE id = ?' , [id] , (err , result) => {
        if(err) throw err ;
        res.json(result) ;
    }) ;
}) ;

//// create :
app.post('/clients/add' , (req , res)=>{
    const {nom , email , telephone} = req.body ;

    db.query('INSERT INTO clients (nom , email , telephone) VALUES (? , ? , ?)' ,[nom , email , telephone] , (err , result) => {
        if(err) throw err ;
        res.json({
            message : 'Client ajoutee avec success !'
        })
    })

});

//// update :

app.post('/clients/:id/update' , (req , res)=>{
    const {id} = req.params ;
    const {nom , email , telephone} = req.body ;

    db.query('UPDATE clients SET (nom , email , telephone) VALUES (? , ? , ?) WHERE id = ?' ,[nom , email , telephone , id] , (err , result) => {
        if(err) throw err ;
        res.json({
            message : 'Client updated avec success !'
        })
    })

});

//// Delete :

app.delete('/clients/:id/delete' , (req , res) => {
    const {id} = req.params ;
    db.query('DELETE FROM fourmateur WHERE id = ?' ,[id] , (err , result)=>{
        if(err) throw err ;
        res.json({message : 'Client deleted successfully'}) ;
    });
});


/// 2.	Implémentez une route SQL pour  insérer une réservation

app.post('/reservation/add' , (req , res)=>{
    const {client_id  , chambre_id , date_arrivee , date_depart , statut} = req.body ;

    db.query('SELECT disponible FROM chambre WHERE id = ?' , [chambre_id] , (err , disponible) => {
        if(err) throw err ;

        res.json(disponible[0])
    });
    if()
    db.query('INSERT INTO clients (client_id  , chambre_id , date_arrivee , date_depart , statut ) VALUES (? , ? , ?)' ,[client_id  , chambre_id , date_arrivee , date_depart , statut] , (err , result) => {
        if(err) throw err ;
        res.json({
            message : 'Reservation ajoutee avec success !'
        })
    })

});



app.listen(port , ()=>{
    console.log(`Server is running on http://localhost:${port}`) ;
});

