var users = [];
var raffle = [];
var shuffled = [];
$('#pick').hide();
var picked = [];
var attempts = 0;
var rafflegenerator = new Firebase("https://rafflegenerator.firebaseio.com");

function loadData(){
    $('.container').prop('disabled',true);
    rafflegenerator.on("value", function(snapshot){
       resetUI();
       db = snapshot.val(); 
       if(_.has(db,"userticketcounts")){
           users = db.userticketcounts;
       }
       if(_.has(db,"generatednumbers")){
           shuffled = db.shuffled;
           printNumbers(db.generatednumbers);
           $('#pick').show();
           $('#generate').hide();
           $("#add").prop('disabled',true);
           $("#tickets").prop('disabled',true);
           $("#uuid").prop('disabled',true);
           
       }else {
           $("#add").prop('disabled',false);
           $("#tickets").prop('disabled',false);
           $("#uuid").prop('disabled',false);
           for(var user in users){
               addRow(user,users[user]);
           }
       }
       $('.container').prop('disabled',false);
    });
}
function reset(){
    rafflegenerator.remove();
    resetUI();
}
function resetUI(){
    picked = [];
    attempts = 0;
    users = [];
    raffle = [];
    shuffled = [];
    $('#pick').hide();
    $('#generate').show();
    $('#resultscontainer').hide();
    $('#numberpicker').empty();
    $('#finalwinner').empty();
    $('#addedUsers').empty();
    
}
function addRow(uuid, numtickets) {
    $('#addedUsers').append('<div class="row"><div class="col-md-5"><label>' + uuid + '</label></div><div class="col-md-7"><label>' + numtickets + '</label></div></div>');
}

function addPerson() {
    var uuid = $('#uuid').val();
    var numtickets = $('#tickets').val();
    if (_.isEmpty(uuid) || _.isEmpty(numtickets)) {
        alert('Please enter all values!');
        return;
    }
    if (_.has(users, uuid)) {
        alert('User Already exists!');
        return;
    }
    users[uuid] = numtickets;
    rafflegenerator.child('userticketcounts').set(users);
   // $('#addedUsers').append('<div class="row"><div class="col-md-5"><label>' + uuid + '</label></div><div class="col-md-7"><label>' + numtickets + '</label></div></div>');

}

function generateMapping() {
    var gen = confirm("No more users can be added unless you reset. Are you sure you want to give everyone their numbers?");
    if(!gen){
        return;
    }
    $('#generate').hide();
    $('#pick').show();
    for (var key in users) {
        useriterator(users[key], key);
    }
    shuffled = _.shuffle(raffle);
    var finalnums = produceNumbers(shuffled);
    //printNumbers(finalnums);
    rafflegenerator.child('shuffled').set(shuffled);
    rafflegenerator.child('generatednumbers').set(finalnums);

}
var countdown = 500;
$('#resultscontainer').hide();
function pickWinner() {
    var randindex = Math.floor(Math.random() * shuffled.length);
    var winner = shuffled[randindex];
    attempts++;

    if(_.indexOf(picked,winner) >= 0 && attempts < 50){
        pickWinner();
        
    }else{
        picked.push(winner);
        attempts = 0;
        $('#resultscontainer').hide();
        $('#numberpicker').html( (randindex + 1));
        $('#finalwinner').html('Which is ' + winner + '\'s number');
        $('#resultscontainer').show(countdown);
    }



}



function printNumbers(finalnums) {
    $('#addedUsers').empty();
    for (var user in finalnums) {
        $('#addedUsers').append('<div class="row"><div class="col-md-5"><label>' + user + '</label></div><div class="col-md-7"><label>' + finalnums[user].join(', ') + '</label></div></div>');
    }
}

function produceNumbers(shuffled) {
    var finalnums = [];
    for (var key in users) {
        finalnums[key] = [];
    }
    for (var i = 0; i < shuffled.length; i++) {

        finalnums[shuffled[i]].push(i + 1);
    }
    return finalnums;
}

function useriterator(value, key) {
    var tickets = parseInt(value);
    while (tickets-- > 0) {
        raffle.push(key);
    }
}