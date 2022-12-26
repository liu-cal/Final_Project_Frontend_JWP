import { useEffect, useState } from 'react';
import axios from 'axios';
import Country from './Country';
import React from 'react';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { useForm } from "react-hook-form";

function WorldList(){
    const [countries, setCountries] = useState([]);
    const [error, setError] = useState("");
    const [possibleCountries,setPossibleCountries]=useState([])
    const {register,handleSubmit,reset,formState:{errors:errors2},setValue:setValue2}=useForm()
    const {register:register2,handleSubmit:handleSubmit2,reset:reset2,setValue,formState: { errors }}=useForm({
        criteriaMode: "all"
      })

    const getPossibleCountries=()=>{
        axios.get('http://localhost:8080/api/possibleCountries')
            .then((response) => {
                if (response.status === 200) {
                    setPossibleCountries(response.data);
                }
            })
            .catch((error) => {
                setError(error.status + " error")
            })
    }

    const loadCountriesFromAPI = () => {
        axios.get('http://localhost:8080/api/countries')
            .then((response) => {
                if (response.status === 200) {
                    setCountries(response.data);
                }
            })
            .catch((error) => {
                setError(error.status + " error")
            })
    }

    var countryId=0
    const getCurrCountry=(name)=>{
        countries.forEach((item)=>{
            if(name==item.name){
                countryId=item.id
            }
        })
    }

    useEffect(() => {
        loadCountriesFromAPI()
        getPossibleCountries()
    }, [])

    const addCountry = (item) => {
        axios.post('http://localhost:8080/api/countries', {
            "name": item.name,
            "population": item.population,
            "selected":false
        })
            .then((response) => {
                if (response.status === 201) {
                    loadCountriesFromAPI();
                }
            })
            .catch((error) => {
                setError(error.status + " error")
            })
    }

    const [citizens, setCitizens] = useState([]);

    const addCitizen = (item) => {
        getCurrCountry(item.country)
        axios.post('http://localhost:8080/api/countries/'+countryId+'/citizens', {
            "name": item.name,
            "selected": false,
            "job":{
                "name":item.job.name,
                "salary":item.job.salary,
                "weeklyHours":item.job.weeklyHours
            }
        })
            .then((response) => {
                if (response.status === 201) {
                    axios.get('http://localhost:8080/api/countries/'+countryId+'/citizens')
                        .then((response) => {
                            if (response.status === 200) {
                                setCitizens(response.data);
                            }
                        })
                        .catch((error) => {
                            setError(error.status + " error")
                        })  
                    loadCountriesFromAPI(); 
                }
            })
            .catch((error) => {
                setError(error.status + " error")
            })

          
    }

    const modifyCountry = (item) => {
        getCurrCountry(item.name)
        console.log(item)
        axios.put(('http://localhost:8080/api/countries/' + countryId), {
            "name": item.name,
            "population":item.population,
            "selected":false
        })
            .then((response) => {
                if (response.status === 200) {
                    loadCountriesFromAPI()
                }
            })
            .catch((error) => {
                setError(error.status + " error")
            })
    }

    const selectCountry = (item) => {
        axios.put(('http://localhost:8080/api/countries/' + item.id), {
            "name": item.name,
            "population":item.population,
            "selected": !item.selected,
        })
            .then((response) => {
                if (response.status === 200) {
                    loadCountriesFromAPI()
                }
            })
            .catch((error) => {
                setError(error.status + " error")
            })
    }

    const deleteCountry = (id) => {
        axios.delete('http://localhost:8080/api/countries/' + id)
            .then((response) => {
                if (response.status === 200)
                    loadCountriesFromAPI()
            })
            .catch((error) => {
                setError(error.status + " error")
            })
    }

    const handleCountrySubmit = (data) => {
        console.log(data)
        const name = data.countryName
        const population = data.population

        if(!populationExist){
            setError("Country name is not valid")
            setCountries([])
            reset()
            return;
        }

        var isAlreadyThere=false;
        countries.forEach((item)=>{
            if(data.countryName==item.name){
                console.log(data.countryName)
                console.log(item.name)
                isAlreadyThere=true
            }
        })
        if(isAlreadyThere){
            modifyCountry({
                "name":name,
                "population":population
            })
        }
        else{
            addCountry({
                "name": name,
                "population": population,
            })
        }

        setError("")
        reset()
        populationExist=false
    }

    const countryInput=document.getElementsByName("country")[0]
    const handleCitizenSubmit = (data) => {

        data.country=countryInput.value
        const citizenName=data.citizenName
        const country=countryInput.value
        const job=data.job
        const salary =data.salary
        const weeklyHours=data.weeklyHours


        var isExist=false;
        countries.forEach((item)=>{
            if(item.name==country){
                isExist=true
            }
        })
        if(!isExist){
            setError("Country hasn't been added");
            setCountries([])
            reset()
            return;
        }

        setError("")
        
        addCitizen({
            "name": citizenName,
            "job": {
                "name":job,
                "salary":salary,
                "weeklyHours":weeklyHours
            },
            "country":country
        })
        reset2()
    } 

    var populationExist=false;
    const handleClick = geo => () => {
        setValue2("countryName",geo.name)
        var geos=geo.name.split(' ')
        var geoFirst=geos[0]
        possibleCountries.forEach((item)=>{
            var items=item.country.split(' ')
            var itemFirst=items[0]
            if(itemFirst==geoFirst){
                setValue2("population",item.population)
                if(items.length>1&&geos.length>1){
                    console.log(1)
                    if(items[1]==geos[1]){
                        console.log(geo)
                        console.log(item)
                        setValue2("population",item.population)
                        populationExist=true
                    }
                }
                else{
                    populationExist=true
                }
            }
        })
        if(!populationExist){
            setValue("population","")
        }
        setValue("country",geo.name)
    }

    return(
        <div className='container'>
            <h1>Country/Citizen Simulation</h1>
            <div className='left'>
                <h3>Add or Modify Countries</h3>
                <form onSubmit={handleSubmit(handleCountrySubmit)}>
                    <input placeholder='Name' {...register("countryName", { 
                        required: "Country name must be provided" 
                    })}></input><br/>

                    <input placeholder='Population' {...register("population", { 
                        required: "Population must be provided", 
                        pattern:{value:/^\d*$/, message:"The population must be a number"},
                        max:{value:1439323776,message:'The largest population is 1,439,323,776'}, 
                        min:{valu:800, message: 'The smallest population is 800'} 
                    })}></input><br/>

                    {errors2.countryName && <p>{errors2.countryName?.message}</p>}
                    {errors2.population && <p>{errors2.population?.message}</p>}
                    <input type="submit"></input>
                </form>

                <h3>Add Citizens</h3>
                <form onSubmit={handleSubmit2(handleCitizenSubmit)}>
                    <input placeholder='Name' {...register2("citizenName", { 
                        required: "Citizen name must be provided"
                    })}></input><br/>

                    <input placeholder='Country' {...register2("country", { 
                        required: "Country name must be provided"
                    })}></input><br/>

                    <input placeholder='Job' {...register2("job", { 
                        required: "Job name must be provided", 
                        minLength:{value:6, message:'The minimum length is 6'}, 
                        maxLength:{value:40, message:'The maximum length is 40'
                    }})}></input><br/>

                    <input placeholder='Salary' {...register2("salary", { 
                        required: "Salary must be provided", 
                        pattern:{value:/^\d*$/, message:"The salary must be a number"},
                        min:{value:0,message:'The minimum is 0'}, 
                        max:{value:5000000,message:'The maximum is 5,000,000'
                    }})}></input><br/>

                    <input placeholder='Weekly Hours' {...register2("weeklyHours", { 
                        required: "Weekly Hours must be provided", 
                        pattern:{value:/^\d*$/, message:"The weekly hours must be a number"},
                        min:{value:0,message:'The minimum is 0'}, 
                        max:{value:100,message:'The maximum is 100'
                    }})}></input><br/>

                    {errors.citizenName && <p>{errors.citizenName?.message}</p>}
                    {errors.country && <p>{errors.country?.message}</p>}
                    {errors.job && <p>{errors.job?.message}</p>}
                    {errors.salary && <p>{errors.salary?.message}</p>}
                    {errors.weeklyHours && <p>{errors.weeklyHours?.message}</p>}
                    <input type="submit"></input>
                </form>
            </div>

            <div className='right'>
                <div>{error}</div>
                <div>{countries.map((item)=>{
                    return <Country country={item} selectCountry={selectCountry} deleteCountry={deleteCountry} citiz={citizens}/>
                })}</div>
            </div>

            <div>
                <ComposableMap width={1000}>
                    <Geographies geography={"https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json"}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                            return <Geography key={geo.rsmKey} geography={geo} 
                            stroke="#000000"
                            tabIndex={-1}
                            style={{
                                default: { outline: "none" },
                                hover: { fill: "#255B52", transition: "0.3s" },
                                pressed: { outline: "none" },
                            }}
                            onClick={handleClick(geo.properties)}/>
                            })
                        }
                    </Geographies>
                </ComposableMap>
            </div>
        </div>
    )
}

export default WorldList;