
// function to show the dashboard

const loadDashboard = async(req,res)=>{

    try{
        res.render("admin/dashboard")
    }
    catch(error){
        console.log(error.message)
    }
}



export default {loadDashboard}