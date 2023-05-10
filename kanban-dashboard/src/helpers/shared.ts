export const handleCloseModal = (event: unknown, reason: string, callback: () => unknown) => {
    console.log(event, reason, )
    if (reason && reason == "backdropClick") 
        callback();   
}