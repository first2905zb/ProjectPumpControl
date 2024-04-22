import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import init from 'react_native_mqtt';

let message = '';
let TankA = 'tank1';
let TankB = 'tank2';
let TankC = 'tank3';
let topicPub = 'inMsg64035885';

// Create a client instance
init({
    size: 10000,
    storageBackend: AsyncStorage,
    defaultExpires: 1000 * 3600 * 24,
    enableCache: true,
    sync: {}
});
const options = {
    host: 'broker.emqx.io',
    port: 8083,
    id: 'id_1' + parseInt(Math.random() * 100000)
};
client = new Paho.MQTT.Client(options.host, options.port, options.id);

const Home = (props) => {
    const [levelA, setLevelA] = useState('XX');
    const [levelB, setLevelB] = useState('XX');
    const [levelC, setLevelC] = useState('XX');
    // const [msg, setMsg] = useState();

    const gotoPlanner = async (tank) => {
        onDisconnect()
        await props.navigation.navigate('Planner', { selectTank: tank });
    }

    useEffect(() => {
        client.connect({ onSuccess: onConnect });
        console.log("connect success");
    }, []);

    const onConnect = () => {
        console.log("onConnect");
        client.subscribe(TankA);
        client.subscribe(TankB);
        client.subscribe(TankC);
        message = new Paho.MQTT.Message("Mobile-CPE451");
        message.destinationName = topicPub;
        client.send(message);
    }

    const onMessageArrived = (message) => {
        console.log("onMessageArrived:" + message.payloadString);
        if (message.destinationName === TankA) {
            setLevelA(message.payloadString);
        }
        else if (message.destinationName === TankB) {
            setLevelB(message.payloadString);
        }
        else if (message.destinationName === TankC) {
            setLevelC(message.payloadString);
        }
    }

    // called when the client loses its connection
    const onConnectionLost = (responseObject) => {
        if (responseObject.errorCode !== 0) {
            console.log('onConnectionLost:' + responseObject.errorMessage);
        }
    }
    const onDisconnect = () => {
        console.log("onDisconnect");
        client.disconnect();
    };
    // set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={{ color: "#000", fontSize: 30 }}>Hi Welcome to My Control</Text>
                <Text style={{ color: "#000", fontSize: 22, marginVertical: 16 }}>เลือกแทงค์น้ำของคุณ</Text>
            </View>
            <View style={styles.body}>
                <View style={styles.box}>
                    <Text style={{ marginLeft: 24, marginTop: 16, fontSize: 20, color: "#000" }}>แทงค์ A</Text>
                    <Text style={{ marginLeft: 16, fontSize: 18, color: "#000", paddingTop: 8 }}>ปริมาณความจุ: 32000 L</Text>
                    <Text style={{ marginLeft: 16, fontSize: 18, color: "#000" }}>ปริมาณน้ำปัจจุบัน: {levelA} L</Text>
                    <View style={{ flex: 1, overflow: 'hidden', borderRadius: 15 }}>
                        <ImageBackground
                            source={{ uri: 'https://t3.ftcdn.net/jpg/05/64/78/72/360_F_564787273_hN9mDW6Tn5VPbIBf5fOPQPa48IqqtQCR.png' }}
                            style={styles.bgImg}>
                            <View style={styles.details}>
                                <TouchableOpacity style={styles.btnDetials} onPress={() => gotoPlanner('TankA')}>
                                    <Text>จัดการน้ำ</Text>
                                </TouchableOpacity>
                                <Image
                                    style={styles.img}
                                    source={{ uri: "https://cdn.icon-icons.com/icons2/2035/PNG/512/weather_raindrops_rain_icon_124168.png" }}
                                />
                            </View>
                        </ImageBackground>
                    </View>

                </View>
                <View style={styles.box}>
                    <Text style={{ marginLeft: 24, marginTop: 16, fontSize: 20, color: "#000" }}>แทงค์ B</Text>
                    <Text style={{ marginLeft: 16, fontSize: 18, color: "#000", paddingTop: 8 }}>ปริมาณความจุ: 24000 L</Text>
                    <Text style={{ marginLeft: 16, fontSize: 18, color: "#000" }}>จำนวนที่ต้องใช้ทั้งหมด: {levelB} L </Text>
                    <View style={{ flex: 1, overflow: 'hidden', borderRadius: 15 }}>
                        <ImageBackground
                            source={{ uri: 'https://t3.ftcdn.net/jpg/05/64/78/72/360_F_564787273_hN9mDW6Tn5VPbIBf5fOPQPa48IqqtQCR.png' }}
                            style={styles.bgImg}>
                            <View style={styles.details}>
                                <TouchableOpacity style={styles.btnDetials} onPress={() =>gotoPlanner('TankB')}>
                                    <Text>จัดการน้ำ</Text>
                                </TouchableOpacity>
                                <Image
                                    style={styles.img}
                                    source={{ uri: "https://cdn.icon-icons.com/icons2/2035/PNG/512/weather_raindrops_rain_icon_124168.png" }}
                                />
                            </View>
                        </ImageBackground>
                    </View>
                </View>
                <View style={styles.box}>
                    <Text style={{ marginLeft: 24, marginTop: 16, fontSize: 20, color: "#000" }}>แทงค์ C</Text>
                    <Text style={{ marginLeft: 16, fontSize: 18, color: "#000", paddingTop: 8 }}>ปริมาณความจุ: 26000 L</Text>
                    <Text style={{ marginLeft: 16, fontSize: 18, color: "#000" }}>จำนวนที่ต้องใช้ทั้งหมด: {levelC} L</Text>
                    <View style={{ flex: 1, overflow: 'hidden', borderRadius: 15 }}>
                        <ImageBackground
                            source={{ uri: 'https://t3.ftcdn.net/jpg/05/64/78/72/360_F_564787273_hN9mDW6Tn5VPbIBf5fOPQPa48IqqtQCR.png' }}
                            style={styles.bgImg}>
                            <View style={styles.details}>
                                <TouchableOpacity style={styles.btnDetials} onPress={() => gotoPlanner('TankC')}>
                                    <Text>จัดการน้ำ</Text>
                                </TouchableOpacity>
                                <Image
                                    style={styles.img}
                                    source={{ uri: "https://cdn.icon-icons.com/icons2/2035/PNG/512/weather_raindrops_rain_icon_124168.png" }}
                                />
                            </View>
                        </ImageBackground>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff'
    },
    header: {
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    body: {
        justifyContent: 'center',
        alignItems: 'center',

    },
    box: {
        width: 350,
        height: 200,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 15,
        marginVertical: 8
    },
    details: {
        marginTop: 24,
        paddingLeft: 24,
        top: -10,
        flexDirection: 'row',
        // justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },

    btnDetials: {
        width: 130,
        height: 30,
        // borderWidth: 1,
        backgroundColor: '#fff',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgImg: {
        width: '100',
        height: '100',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        overflow: 'hidden',
        flex: 1,
        borderRadius: 15,
    },
    img: {
        width: 60,
        height: 84,
        left: 88,
        top: -10
    }
})
