const express = require('express') ;
const mysql = require('mysql2') ;
const app = express() ;
const port = 3000 ;

app.use(express.json()) ;

const db = mysql.createConnection({
    host : 'localhost' ,
    database : 'gestion_stagiaire' ,
    user : 'root' ,
    password : ''
})

db.connect((err) => {
    if(err){
        console.error('Error connecting to mysql: ', err.message);
        return;
    }
});


/// 2.	Créer une API pour insérer un nouvel stagiaire. Vous devez vérifier d’abord l’existence du groupe dans la base de données.

app.post('/stagiaire/add' , (req , res)=>{
    const {nom , ville , id_group} = req.body ;
    db.query('SELECT * FROM groupe WHERE id = ?' , [id_group] , (err , groupe_exist) => {
        if(err) throw err ;
        if(groupe_exist.length === 0){res.status(404).json({
            message : 'groupe n\'existe pas' 
        })} ;

        db.query('INSERT INTO stagiaire (nom , ville , id_group) VALUES (? , ? , ?)' ,[nom , ville , id_group] , (err , result) => {
            if(err) throw err ;
            res.json({
                message : 'Stagiaire ajoutee avec success !'
            })
        })

    });
})

/// 3.	Créer une API pour modifier la ville des stagiaires du groupe dont l’id est donné en paramètre.

app.put('/stagiaire/update_ville/:group_id', (req , res)=> {
    const {group_id} = req.params ;
    const {ville} = req.body ;

    db.query('UPDATE stagiaire SET ville = ? WHERE group_id = ?' ,[ville , group_id] , (err,result)=>{
        if(err) throw err ;
        res.json({message : 'Stagiaire Updated successfully'}) ;
    });
});

/// 4.	Créer une API pour supprimer les formateurs dont la ville est donnée en paramètre.

app.delete('/stagiaire/:ville' , (req , res) => {
    const {ville} = req.params ;
    db.query('DELETE FROM fourmateur WHERE ville = ?' ,[ville] , (err , result)=>{
        if(err) throw err ;
        res.json({message : 'Stagiaire deleted successfully'}) ;
    });
});

/// 5.	Créer une API pour afficher la liste de tous les stagiaires trier par id groupe.

app.get('/stagiaire/groupTrie' , (req , res)=> {
    db.query('SELECT * FROM stagiaire ORDER BY id_group ' , (err , result) => {
        if(err) throw err ;
        res.json(result) ;
    }) ;
}) ;

/// 6.	Créer une API pour afficher le stagiaire par id.

app.get('/stagiaire/:id' , (req , res) => {
    const {id} = req.params ;
    db.query('SELECT * FROM stagiaire WHERE id = ?' , [id] , (err , result) => {
        if(err) throw err ;
        res.json(result[0]) ;
    })
})

/// 7.	Créer une API pour afficher la liste des stagiaires par nom du groupe. 

app.get('/stagiaire/group/:nom' , (req , res) => {
    const {nom} = req.params ;
    db.query('SELECT s.id, s.nom, s.ville, g.nom AS nom_groupe FROM stagiaire  s JOIN groupe g ON s.id_group = g.id WHERE g.nom = ?' , [nom] , (err , result) => {
        if(err) throw err ;
        res.json(result) ;
    }) ;
} );

/// 8.	Créer une API pour afficher la liste des stagiaires par nom du formateur.

app.get('/stagiaire/formateur/:nom' , (req , res) => {
    const {nom} = req.params ;
    db.query('SELECT s.id, s.nom, s.ville, f.nom AS formateur FROM stagiaire  s JOIN fourmateur f ON f.id_group = s.id_group WHERE f.nom = ?' , [nom] , (err , result) => {
        if(err) throw err ;
        res.json(result) ;
    }) ;
} );

/// 9.	Créer une API pour afficher la liste des stagiaires qui étudient le module dont le nom est donné en paramètre.

app.get('/stagiaire/module/:nom' , (req , res) => {
    const {nom} = req.params ;
    db.query('SELECT s.id, s.nom, s.ville, m.nom AS module FROM stagiaire  s JOIN fourmateur f ON f.id_group = s.id_group JOIN module m ON f.id_module = m.id WHERE m.nom = ?' , [nom] , (err , result) => {
        if(err) throw err ;
        res.json(result) ;
    }) ;
} );

/// 10.	Créer une API pour afficher la liste des formateurs qui enseignent le module dont le nom est donné en paramètre.

app.get('/formateur/module/:nom' , (req , res) => {
    const {nom} = req.params ;
    db.query('SELECT f.id, f.nom, f.ville, m.nom AS module FROM fourmateur f JOIN module m ON f.id_module = m.id WHERE m.nom = ?' , [nom] , (err , result) => {
        if(err) throw err ;
        res.json(result) ;
    }) ;
} );

/// 11.	Créer une API pour afficher le nombre de stagiaires par id formateur et par id module.

app.get('/stagiaire/nb' , (req , res) => {
    db.query('SELECT COUNT(*) , f.nom AS formateur FROM stagiaire  s JOIN fourmateur f ON f.id_group = s.id_group  GROUP BY f.id , f.id_module' , (err , result) => {
        if(err) throw err ;
        res.json(result) ;
    }) ;
} );




app.listen(port , ()=>{
    console.log(`Server is running on http://localhost:${port}`) ;
});

