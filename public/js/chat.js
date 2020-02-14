const socket = io();

socket.on('message' , (message)=>{
    document.querySelector('#messages').innerHTML += `<li>${message}</li>`
})

document.querySelector('#send').addEventListener('click' , (e)=>{
    e.preventDefault();

    const message = document.querySelector('#m').value
    document.querySelector('#m').value = "";
    
    if(message !== ""){
        socket.emit('chatMessage' , message , (error)=>{
            if(error){
                return document.querySelector('#messages').innerHTML += `<li>${error}</li>`;
            }

            document.querySelector('#messages').innerHTML += `<li>Delivered!</li>`;
            
        });
    }
})

document.querySelector('#send_location').addEventListener('click' , ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser!');
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation' , {
            lat: position.coords.latitude,
            long: position.coords.longitude
        },()=>{
            document.querySelector('#messages').innerHTML += `<li>Location shared!</li>`;
        })
    })
})
