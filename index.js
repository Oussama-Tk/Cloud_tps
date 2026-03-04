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

/// I. Requêtes CRUD de base (Rappel) :



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
    const {id} = req.params ;
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

    db.query('UPDATE clients SET nom = ? , email = ? , telephone = ? WHERE id = ?' ,[nom , email , telephone , id] , (err , result) => {
        if(err) throw err ;
        res.json({
            message : 'Client updated avec success !'
        })
    })

});

//// Delete :

app.delete('/clients/:id/delete' , (req , res) => {
    const {id} = req.params ;
    db.query('DELETE FROM clients WHERE id = ?' ,[id] , (err , result)=>{
        if(err) throw err ;
        res.json({message : 'Client deleted successfully'}) ;
    });
});


/// 2.	Implémentez une route SQL pour  insérer une réservation

app.post('/reservation/add' , (req , res)=>{
    const {client_id  , chambre_id , date_arrivee , date_depart , statut} = req.body ;

    db.query('SELECT disponible FROM chambre WHERE id = ?' , [chambre_id] , (err , disponible) => {
        if(err) throw err ;
        if(disponible[0] === false){
            res.status(400).json({message : 'La chambre est Indisponible !!'}) ;
        }

        db.query('INSERT INTO reservations (client_id  , chambre_id , date_arrivee , date_depart , statut ) VALUES (? , ? , ? ,? , ?)' ,[client_id  , chambre_id , date_arrivee , date_depart , statut] , (err , result) => {
        if(err) throw err ;
        db.query('UPDATE chambre SET disponible = ? WHERE id = ?' , [0 , chambre_id] , (err , result)=> {
            if(err) throw err ;
            res.json({
                message : 'Reservation ajoutee avec success !'
            })
        }) ;
    })
    });

});

//// II. Requêtes SQL avancées :

//// 1.	Implémentez une route qui retourne la liste des chambres disponibles pour une période donnée. (ex: du 2025-03-10 au 2025-03-15) :

app.get('/chambres' , (req , res)=> {
    const {date_d , date_a} = req.body ;
    db.query('SELECT * FROM chambres c JOIN reservations r ON c.id = r.chambre_id WHERE r.date_depart < ? OR r.date_arrivee > ? ' , [date_a , date_d] , (err , result) => {
        if(err) throw err ;
        res.json(result) ;
    }) ;
}) ;

//// 2.	Implémentez une route pour calculer le revenu total généré par les réservations entre deux dates :

app.get('/reservations/total_revenue' , (req , res)=> {
    const {date_d , date_a} = req.body ;

    db.query(`SELECT SUM(DATEDIFF(r.date_depart, r.date_arrivee) * c.prix_par_nuit) AS revenu_total
        FROM reservations r
        JOIN chambres c ON r.chambre_id = c.id
        WHERE r.statut != 'annulée'
        AND r.date_depart <= ? AND r.date_arrivee >= ?` , [date_d , date_a] , (err , result) => {
        if(err) throw err ;
        res.json({total : result}) ;
    }) ;
}) ;

//// 3.	Implémentez une route pour afficher les clients qui ont effectué plus de 3 réservations au cours des 6 derniers mois.

app.get('/clients/reservations/plus_trois' ,(req , res)=> {
    db.query(`SELECT c.nom FROM clients c
        JOIN reservations r ON c.id = r.client_id
        WHERE r.date_arrivee >= DATE_SUB(CURRENT_DATE , INTERVAL 6 MONTH)
        GROUP BY c.nom
        HAVING COUNT(r.id) >= 2` ,(err , resultat) =>{

            if(err) throw err ;
            res.json({clients : resultat}) ;
        }) ;
});

//// 4.	Implémentez une requête pour récupérer la chambre la plus réservée au cours des 12 derniers mois.

app.get('/chambres/plus_reservee' , (req , res) => {
    db.query(`SELECT c.id , c.numero , c.type , c.prix_par_nuit , COUNT(r.id) as nb_r FROM chambres c 
        JOIN reservations r ON r.chambre_id = c.id
        WHERE r.date_arrivee >= DATE_SUB(CURRENT_DATE , INTERVAL 12 MONTH)
        GROUP BY c.id
        HAVING nb_r = (SELECT COUNT(id) FROM reservations  WHERE date_arrivee >= DATE_SUB(CURRENT_DATE , INTERVAL 12 MONTH)
        GROUP BY chambre_id 
        ORDER BY COUNT(id) DESC 
        LIMIT 1)` , (err , resultat) => {
            if(err){
                console.error(err);
                return res.status(500).json({message : 'Un Erreur est servenu !!'}) ;
            } ;
            if (resultat.length === 0) {
                return res.status(404).json({ message: "Aucune réservation trouvée dans cette période." });
            }
            res.json({chambres : resultat}) ; 
        })
})

////////////////////////////////////////////////////////////////
app.listen(port , ()=>{
    console.log(`Server is running on http://localhost:${port}`) ;
});
