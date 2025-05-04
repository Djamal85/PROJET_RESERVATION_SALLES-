document.addEventListener("DOMContentLoaded", () => {

    // Inscription

    //initialisation de la base donnée simulé
    let user = JSON.parse(localStorage.getItem("users")) || [];

    //Gestion d'inscription
    document.getElementById("formInscrip").addEventListener("submit", function (e) {
        e.preventDefault();

        //recuperation des champs
        const userName = document.getElementById("userName").value;
        const email = document.getElementById("mail").value;
        const motDePasse = document.getElementById("mdp").value;

        // Verifier si l'email existe deja
        let EmailExiste = user.find((u) => u.email === email);
        if (EmailExiste) {
            alert("Email existe deja");
        }else {
            const newUser = { userName, email, motDePasse };
            user.push(newUser);
            localStorage.setItem("users", JSON.stringify(user));
            alert("Inscription reussite");
        }
        
    })

    
    // Connexion

    document.getElementById("formConnexion").addEventListener("submit", function (e) {
        e.preventDefault();

        //recuperation des champs
        const email = document.getElementById("mailConnexion").value;
        const motDePasse = document.getElementById("mdpConnexion").value;

        // console.log(userName, email, motDePasse);
        // const user = JSON.parse(localStorage.getItem("users"))||[];
        const userFound = user.find((u) => u.email === email && u.motDePasse === motDePasse);

        if (userFound) {
            alert("Connexion reussite");
            // window.location.href = "index.html";
        } else {
            alert("Email ou mot de passe incorrect");
        }
    })
})