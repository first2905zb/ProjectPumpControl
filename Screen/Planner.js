import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import init from 'react_native_mqtt';

let message = '';
let topicPub = 'inMsg64035885';
let topicPubA = 'TankA';
let topicPubB = 'TankB';
let topicPubC = 'TankC';
let TankA = 'tank1';
let TankB = 'tank2';
let TankC = 'tank3';

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
    id: 'id_2' + parseInt(Math.random() * 100000)
};
client = new Paho.MQTT.Client(options.host, options.port, options.id);

const Planner = (props) => {
    const [selectTank, setSelectTank] = useState();
    const [productSections, setProductSections] = useState(3);
    const [sectionQuantity, setSectionQuantity] = useState("1");
    const [inValue, setInvalue] = useState(Array(3).fill(''));
    const [productValue, setProductValue] = useState(Array(3).fill(''));
    const [levelA, setLevelA] = useState('XX');
    const [levelB, setLevelB] = useState('XX');
    const [levelC, setLevelC] = useState('XX');
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        client.connect({ onSuccess: onConnect });
        console.log("connect success");
        if (props.route.params !== undefined && props.route.params !== null) {
            setSelectTank(props.route.params.selectTank)
        }
    }, [props.route.params]);

    const insertData = (need) => {
        fetch('http://10.0.2.2:5000/control', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tankName: selectTank,
                need: need
            }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    const insertProduct = () => {
        const products = inValue.map((name, index) => ({
            name: name,
            waterRequire: productValue[index]
        }));

        console.log('Products:', products);

        fetch('http://10.0.2.2:5000/control/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(products),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    const onConnect = () => {
        console.log("onConnect");
        client.subscribe(TankA);
        client.subscribe(TankB);
        client.subscribe(TankC);
        message = new Paho.MQTT.Message("Mobile2-CPE451");
        message.destinationName = topicPub;
        client.send(message);
    }

    const sendMessage = (msg) => {
        message = new Paho.MQTT.Message(msg);
        if (selectTank === topicPubA) {
            message.destinationName = topicPubA;
            client.send(message);
        }
        else if (selectTank === topicPubB) {
            message.destinationName = topicPubB;
            client.send(message);
        }
        else if (selectTank === topicPubC) {
            message.destinationName = topicPubC;
            client.send(message);
        }
    }

    const checkCircleColor = (circleName) => {
        if (selectTank === circleName) {
            return { borderColor: '#009418', color: '#009418' };
        }
        return {};
    };

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

    const addProductSections = () => {
        const quantity = parseInt(sectionQuantity);
        setProductSections(prevSections => prevSections + quantity);
        setInvalue(prevInValue => [...prevInValue, ...Array(quantity).fill('')]);
    };

    const save = () => {
        const total = productValue.reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
        // setWaterTotal(total);
        sendMessage(total.toString());
        insertData(total);
        insertProduct();
        setModalVisible(true); // Open the modal when saving
        setInvalue(Array(3).fill(''));
        setProductValue(Array(3).fill(''));
        onDisconnect();
    }

    return (
        <ScrollView style={styles.container}>
            <View style={{ flex: 0.3, justifyContent: 'center' }}>
                <Text style={{ marginBottom: 16, fontSize: 30, color: "#000" }}>Tank ปัจจุบัน: {selectTank}</Text>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={[styles.circle, checkCircleColor('TankA')]} onPress={() => setSelectTank("TankA")}>
                        <Text style={[checkCircleColor('TankA'), { fontSize: 24 }]}>Tank A</Text>
                        <Text>{levelA} L</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.circle, checkCircleColor('TankB')]} onPress={() => setSelectTank("TankB")}>
                        <Text style={[checkCircleColor('TankB'), { fontSize: 24 }]}>Tank B</Text>
                        <Text>{levelB} L</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.circle, checkCircleColor('TankC')]} onPress={() => setSelectTank("TankC")}>
                        <Text style={[checkCircleColor('TankC'), { fontSize: 24 }]}>Tank C</Text>
                        <Text>{levelC} L</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ flex: 0.7 }}>
                {[...Array(productSections)].map((_, index) => (
                    <View key={index} style={{ paddingHorizontal: 24, paddingVertical: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <Text>สินค้า {index + 1}: </Text>
                            <TextInput
                                value={inValue[index] || ''}
                                onChangeText={(text) => {
                                    const newInValue = [...inValue];
                                    newInValue[index] = text;
                                    setInvalue(newInValue);
                                }}
                                placeholder={`โปรดกรอกชื่อสินค้า ${index + 1}`}
                            />

                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center' }}>
                            <TextInput
                                style={styles.input}
                                placeholder='ปริมาณน้ำทั้งหมดของผลิตภัณฑ์นี้'
                                value={productValue[index] || ''}
                                keyboardType="numeric"
                                onChangeText={(text) => {
                                    const newInValue = [...productValue];
                                    newInValue[index] = text;
                                    setProductValue(newInValue);
                                }}
                            />
                        </View>
                    </View>
                ))}
                <View style={{ flexDirection: "row", marginTop: 16, justifyContent: 'center' }}>
                    <TextInput
                        style={styles.inputQuantity}
                        placeholder="Quantity"
                        keyboardType="numeric"
                        value={sectionQuantity}
                        onChangeText={setSectionQuantity}
                    />
                    <TouchableOpacity style={styles.addSectionButton} onPress={addProductSections}>
                        <Text style={{ color: "#fff" }}>Add Sections</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 16, }}>
                    <Text>ปริมาณน้ำที่ต้องการทั้งหมด: {productValue.reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0)} L</Text>
                </View>
                <View style={{ marginTop: 16, paddingHorizontal: 24 }}>
                    <View style={styles.submit}>
                        <TouchableOpacity style={styles.btnSubmit} onPress={() => save()}>
                            <Text style={{ color: "#fff", fontSize: 20, fontWeight: 'bold' }}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Complete</Text>
                        <TouchableOpacity
                            style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                            onPress={() => {
                                setModalVisible(false);
                                props.navigation.navigate("Home");
                            }}
                        >
                            <Text style={styles.textStyle}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </ScrollView>
    )
}

export default Planner

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
        backgroundColor: "#fff"
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    circle: {
        borderWidth: 1,
        borderRadius: 100,
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: "#5DCCFC",
        backgroundColor: '#EAF8FE'
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#ddd",
        width: 320,
        paddingLeft: 16,
        backgroundColor: "#E8E8E8"
    },
    inputQuantity: {
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#ddd",
        width: 100,
        paddingLeft: 16,
        backgroundColor: "#E8E8E8"
    },
    addSectionButton: {
        backgroundColor: '#5DCCFC',
        padding: 10,
        borderRadius: 8,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    submit: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    btnSubmit: {
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#ddd",
        width: 250,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5DCCFC'
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // ตั้งค่าสีพื้นหลังของ Modal ให้เป็นสีดำและเบลอ
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
});
