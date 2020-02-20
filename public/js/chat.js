const socket = io();


//Elements
const $button = document.querySelector('#send');
const $messages = document.querySelector('#messages');
const $sendLocationButton = document.querySelector('#send_location');
const $form = document.querySelector('#m');

//Options

const {username , room} = Qs.parse(location.search , { ignoreQueryPrefix: true});


socket.on('message' , (message)=>{
    $messages.innerHTML += `<li>
    <p><b>${message.user} - ${moment(message.createdAt).format("h:m A")}</b></p>
    <p>${message.text}</p></li>`;
    window.scrollTo(0,document.body.clientHeight);
})

$button.addEventListener('click' , (e)=>{
    e.preventDefault();

    const message = $form.value;
    
    if(message !== ""){

        $button.setAttribute('disabled', 'disabled');

        socket.emit('chatMessage' , message , (error)=>{
            $form.value = "";
            $button.removeAttribute('disabled');
            $form.focus();

            if(error){
                return $messages.innerHTML += `<li>${error}</li>`;
            }
            
            lastOccurrence = $messages.getElementsByTagName('b').length -1;
            $messages.getElementsByTagName('b')[lastOccurrence].innerHTML  += ' ✔'        
        });
    }
})

$sendLocationButton.addEventListener('click' , ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser!');
    }
    $sendLocationButton.setAttribute('disabled' , 'disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation' , {
            lat: position.coords.latitude,
            long: position.coords.longitude
        },()=>{
            lastOccurrence = $messages.getElementsByTagName('b').length -1;
            $messages.getElementsByTagName('b')[lastOccurrence].innerHTML  += ' ✔'   
            $sendLocationButton.removeAttribute('disabled');
            $form.focus();
        })
    })
})


socket.emit('join' , {username , room} , (error)=>{
    if(error){
        alert(error);
        location.href = '/';
    }
});


//Refreshing room users list

socket.on('roomData',({room  , users})=>{
    console.log(users)
    document.querySelector('#userList').innerHTML ="";
    users.forEach((user)=>{
        document.querySelector('#userList').innerHTML += `<li>-- ${user.username}</li>`;
    })
})


