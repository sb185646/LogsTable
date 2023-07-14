const html = (content) => `<html>
    <script> 
    function myJavascriptFunction() {
        window.open('/pods') 
    }
    </script>
    <style>
        .app-button{
            height: 50px;
            width: 125px;
            border-radius: 25px;
            background: #33c464;
            border: none;
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
        }
        .app-button:hover{
            background: #da7474;
        }
        .link{
            flex:1;
            text-decoration: none;
            color: black;
        }
        .row{
            margin: 0px;
            white-space: break-spaces;
            display: flex;
            justify-content: space-evenly;
            align-items: center;
            padding: 5px;
            border: 1px solid black;
            width:900px;
        }
        .rowHeader{
            margin: 0px;
            white-space: break-spaces;
            display: flex;
            justify-content: space-evenly;
            align-items: center;
            padding: 5px;
            width:900px;
        }
        .row > *{
            border-right: 1px solid black;
        }
        .row:nth-child(odd){
            background: #e6f0e9;
        }
    </style>
    <body>
    <div style=text-align:center;>
    ${content}</div>
    
    </body> 
    </html>`
// render
module.exports = { html }