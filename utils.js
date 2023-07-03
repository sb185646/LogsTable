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
    </style>
    <body>
    <div style=text-align:center;>
    ${content}</div>
    
    </body> 
    </html>`
// render
module.exports = { html }