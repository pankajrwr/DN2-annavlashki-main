

$(document).ready(() => {
    let customerSet = [];
    let relatedUser;
    let companyTypes;
    $.get("/customers", (customers) => {
        customerSet = customers;
        console.log(customerSet);
    });

    

      
    const country = document.querySelector('input#country');
    const lastName = document.querySelector('input#LastName');
    const dopolniPodatke = document.querySelector('#dopolniPodatke');
    const formObj   =   document.querySelector("#stranke form");
    const registerButton = document.querySelector("#Register");
    let customerPostData = {};

    // registerButton.addEventListener('click', (event)=>{
    //     event.preventDefault();
    //     console.log('submitting the form', customerPostData);
    //     $.post("/prijava/1",JSON.stringify(customerPostData), (response) => {
    //         console.log(response);
    //     });
    // })

    formObj.addEventListener('input', (event) =>{
        const allFormFields = document.querySelectorAll("#stranke form input, #stranke form select");
        let allInputsFilled = false;
        for(let element of allFormFields){
            allInputsFilled = (element.value) ? true : false;
            if(element.type !== 'submit'){
                customerPostData[element.name] = element.value;
            }
            if(!allInputsFilled){
                customerPostData = {};
                break;
            }
        }
console.log('postt', customerPostData);
        registerButton.disabled = !allInputsFilled;
    })

    country.addEventListener('input', (event) => {
        const countryName = event.target.value;
        const blnValidCountry = verifyCountryName(countryName);
        if(blnValidCountry){
            document.querySelector("#country").className = 'form-control form-control-sm dovoljeno';
            document.querySelector("#CountryStatus .fas").className = 'fas fa-check'
        }else{
            document.querySelector("#country").className = 'form-control form-control-sm';
            document.querySelector("#CountryStatus .fas").className = 'fas fa-times'
        }
    });

    lastName.addEventListener('input', (event)=>{
        const lastName = event.target.value;
        relatedUser = getRelatedUser(lastName);

        if(relatedUser){
            document.getElementById('dopolniPodatke').disabled = false;
            document.getElementById('dopolniPodatke').title = relatedUser.FirstName+" "+relatedUser.LastName;
        }else{
            document.getElementById('dopolniPodatke').disabled = true;
            document.getElementById('dopolniPodatke').title = '';
        }
    })

    dopolniPodatke.addEventListener('click', (event)=>{
        $.get("/companyTypes", (companyTypes) => {
            fillFormDetails(relatedUser, companyTypes);
        });
    })
    
    const fillFormDetails = (userDetails, companyTypes) => {
        console.log('companyTypes:', companyTypes);
        

        document.getElementById('CompanyString').value = userDetails.Company;
        document.getElementById('PostalCode').value = userDetails.PostalCode;
        document.getElementById('Address').value = userDetails.Address;
        document.getElementById('City').value = userDetails.City;
        document.getElementById('Country').value = userDetails.Country;
        document.getElementById('Phone').value = userDetails.Phone;
        document.getElementById('Fax').value = userDetails.Fax;
        document.getElementById('Email').value = "@"+userDetails.Email.split('@')[1];
        
        populateVrstaPodjetja(companyTypes)
    }

    const populateVrstaPodjetja = (companyTypes) => {
        companyTypes.map(companyType => {
            console.log(companyType);
            $("#CompanyType").append(
                "<option value='" + companyType.tip + "'>" + companyType.tip + "</option>"
              );
        })
    }

    const getRelatedUser = (LastName) => {
        const relatedUser = customerSet.find(customer => customer.LastName.toLowerCase() == LastName.toLowerCase())
        return relatedUser;
    }

    const verifyCountryName = (country) => {
        const regStartsWithCapital      =   /[A-Z]/;
        const regLengthAndIlligalChar   =   /^[a-zA-Z' ]{3,15}$/;
        const intLength =   country.length;

        return (
            regStartsWithCapital.test(country) 
            && regLengthAndIlligalChar.test(country)
        )
    }
});
