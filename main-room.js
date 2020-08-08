import React, {useEffect} from 'react'
import entranceLayout from "../../components/layouts/entranceLayout"

const MainRoom = (props) => {
    if (props.userData.clientId) return (
        <>
            {entranceLayout(props,
                () => <>
                    <div id={"topbar"}>
                        <h2>Panel główny</h2>
                        <a href={``}>Odpowiedz na kolejne pytania</a>
                    </div>
                </>,
                () => <>
                    <input type={"text"} placeholder={"szukaj na liście znajomych"}/>
                    <ul id={"friends"}>
                        <li id={"friend1"}>
                            <img src={"/img/zielony.svg"} width={"12px"} alt={""}/>
                            <img src={"/img/czerwony.svg"} width={"40px"} alt={""} className={"profile_picrure"}/>
                            <p className={"profile_name"}>Hubert13888</p>
                        </li>
                        <li id={"friend2"}>
                            <img src={"/img/czerwony.svg"} width={"12px"} alt={""}/>
                            <img src={"/img/czerwony.svg"} width={"40px"} alt={""} className={"profile_picrure"}/>
                            <p className={"profile_name"}>Alfred12</p>
                        </li>
                    </ul>
                    <button>Załaduj więcej</button>
                    <a href={`/${props.query.lang}/search-people`}>
                        <button>Szukaj nowych znajomych</button>
                    </a>
                    <a href={`/${props.query.lang}/answer-questions`}>
                        <button>Odpowiadaj na pytania</button>
                    </a>
                </>
            )}
        </>
    )
    useEffect(() => location.href = `/${props.query.lang}`, [])
    return (<></>)
}

export default MainRoom