export const errResponseMessage = (res,err,status,message) => {
    if(err){
        res.status(status).json({
            status:status,
            message:message
        })
        return
    } 
}
export const successResponseMessage = (res,status,message) => {
    res.status(status).json({status:status,message:message})
}
export const successResponseData = (res,status,data) => {
    res.status(status).json({status:status,data:data})
}
export const formatDate = (date) => {
    const checkDate = date ? new Date(date) : new Date()
    return checkDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  