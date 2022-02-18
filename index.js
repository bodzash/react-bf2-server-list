function ListItem(props) {

    let styles = {}

    if (props.count > 0) { styles.color = "greenyellow"}  

    if(props.hoverOver) {
        styles.backgroundColor = "rgba(172, 255, 47, 0.15)"
    }

    return(
        <div className="list-item" style={styles} onClick={props.click}>
            <p className="list-item-name">{props.name}</p>
            <p className="list-item-map">{props.map}</p>
            <p className="list-item-count">{props.count}<i className="material-icons">person_outline</i></p>
        </div>
    )
}

function App() {

    const [state, setState] = React.useState(false)
    const [serverCount, setServerCount] = React.useState(0)
    const [copy, setCopy] = React.useState("") 
    const [list, setList] = React.useState([])
    const [actualList, setActualList] = React.useState([])
    const [hover, setHover] = React.useState(-1)

    function actaulPlayerCount(server) {
        server.playersActual = 0
        server.team1Count = 0
        server.team2Count = 0
        server.players.map(player=> {
            if (player.ping === 0 ) {
                //its a bot so ignore
            } else {
                server.playersActual += 1
            }
        })
    }

    function refreshList() {
        setList([])
        setState(false)
        setHover(-1)
        fetchServers(serverCount)
    }

    function setBack(map) {

        let name

        switch(map) {
            case "Ghost Town":
                name = "GhostTown"
            break
            case "Surge":
                name = "Surge"
            break
            case "Warlord":
                name = "Warlord"
            break
            case "The Iron Gator":
                name = "TheIronGator"
            break
            case "Mass Destruction":
                name = "MassDestruction"
            break
            case "Leviathan":
                name = "Leviathan"
            break
            case "Night Flight":
                name = "NightFlight"
            break
            case "Devil's Perch":
                name = "DevilsPerch"
            break
        }

        const root = document.getElementById("root")
        root.style.background = `url('./images/maps/${name}.png') no-repeat center`
        root.style.backgroundSize = "cover"
    }

    function copyAddress() {
        //state && console.log(copy)
        state && navigator.clipboard.writeText(copy);
        
    }

    function fetchServers(page) {
        for(let i=1; i < page+1; i++) {
            fetch("https://api.bflist.io/bf2/v1/servers/"+i)
                .then(res=> res.json())
                .then(data=> {
                    setList(oldList=> {
                        return [...oldList, data]
                    })
                })
        }
    }

    React.useEffect(()=> {
        let sfList = []
        list.map(item=> {
            item.map(subItem=> {
                if (subItem.ranked && subItem.gameVariant === "xpack" && subItem.gameType === "gpm_cq") {
                    actaulPlayerCount(subItem)
                    sfList.push(subItem)
                }
            })
        })
        setActualList(sfList)
    }, [list])

    React.useEffect(()=>{
        fetch("https://api.bflist.io/bf2/v1/livestats")
            .then(res=> res.json())
            .then(data=> {
                let serverPages = Math.ceil(data.servers/50)
                setServerCount(serverPages)
                fetchServers(serverPages)
            })
    }, [0])

    return(
        <main className="container">
            <div className="list-wrapper">{
                actualList.map((item, index)=> {
                    return (
                        <ListItem
                            click={()=> {
                                setCopy(item.ip+":"+item.port)
                                setBack(item.mapName)
                                setState(true)
                                setHover(index)
                            }}
                            key={item.guid}
                            id={index}
                            name={item.name}
                            count={item.playersActual}
                            ip={item.ip}
                            port={item.port}
                            map={item.mapName}
                            hoverOver={hover === index ? true : false}
                        />
                    )
                })
            }
            </div>
            <button className="refresh" onClick={refreshList}>REFRESH LIST</button>
            <div className={!state ? "details-red" : "details"} onClick={copyAddress}>{ !state ? "Select a server first" : "Copy IP and PORT"}</div>
            <div className="overlay"></div>
        </main>
    )
}

ReactDOM.render(<App />, document.getElementById("root"))