let users = [{
    id: "das7y87dasdas1121",
    name: "Osas",
    email: "osas@gmail.com",
    age:33
}, 
{
    id: "das7y87dasdas1122",
    name: "Tony",
    email: "tony@gmail.com",
    age:29
},
{
    id: "das7y87dasdas1123",
    name: "Tammy",
    email: "tammy@gmail.com",
    
}

]



let posts = [
    {
        id: "wer234e2323",
        title: "Uncle Gazpacho",
        body: "Yeah the boys at the marine like to call this one uncle Gazpacho, I call it the ex wife, capable of reducing the population of every standing structure to zero",
        published: false,
        author: "das7y87dasdas1121"
    },{
        id: "wer234e2324",
        title: "Stark Biography",
        body: "Cheap trick and a cheesy oneliner that's all you got?? Sweetheart that could be the title of my autobiography",
        published: true,
        author: "das7y87dasdas1121"
    },{
        id: "wer234e2325",
        title: "Baba Yaga",
        body: "It is not what you did that angers me so, it's who you did it to... Who?? That fucking nobody??.. That fucking nobody is John Wick!! John was once an associate of ours, we called him Baba Yaga..",
        published: false,
        author: "das7y87dasdas1123"
    }
]


let comments = [
    {
        id:"tyuyt5676t77657",
        text:"lol that's crazy",
        author: "das7y87dasdas1122",
        post: "wer234e2323"
    },
    {
        id:"tyuyt5676t77658",
        text:"you tripping",
        author: "das7y87dasdas1123",
        post: "wer234e2325"
    },
    {
        id:"tyuyt5676t77659",
        text:"hmm ok",
        author: "das7y87dasdas1122",
        post: "wer234e2324"
    },
    {
        id:"tyuyt5676t77660",
        text:"well uhmmmmmm...",
        author: "das7y87dasdas1121",
        post: "wer234e2324"
    }
]

const db = {
    users,
    posts, 
    comments
};
export {db as default}