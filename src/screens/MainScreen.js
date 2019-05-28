import React, { Component } from 'react'
import { Text, View, StatusBar, StyleSheet, FlatList, TouchableOpacity,ActivityIndicator,PermissionsAndroid  } from 'react-native'
import { Icon,Divider } from 'react-native-elements'
import Geocoder from 'react-native-geocoder';
import Geolocation from 'react-native-geolocation-service';
import API from '../api'
import moment from 'moment'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import DropdownAlert from 'react-native-dropdownalert';

export class MainScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            latitude:'',
            longitude:'',
            country:'',
            city:'',
            countrycode:'',
            refreshing:false,
            data:[],
            todayData:{},
            todayWeather:'',
            todayTemp:0
        }

      
    }


    renderItem = ({ item }) => {
        return (
            this.state.refreshing?null:
            <View>
                <TouchableOpacity style={{ flexDirection: 'row', height: verticalScale(80), justifyContent: 'space-between', paddingVertical: moderateScale(15,0.1), paddingLeft: moderateScale(15,0.1), paddingRight: moderateScale(18,0.1) }}>
                    <View style={{ justifyContent: 'center' }}>
                        <Text style={{color:'#000',fontWeight:'bold',fontSize:moderateScale(15,0.1)}}>{moment(item.dt_txt).format('DD MMM YYYY, ddd hh:mm A')}</Text>
                        <Text style={{color:'#000',fontSize:moderateScale(15,0.1)}}>{this.toCelsius(item.main.temp)} °C</Text>
                        <Text style={{color:'#a9a9a9',fontSize:moderateScale(15,0.1)}}>{item.weather[0].description}</Text>
                    </View>
                    <View style={{ justifyContent: 'center' }}>
                        <Icon
                            name='right'
                            type='antdesign'
                            color='#ff0000'
                            size={moderateScale(18,0.1)}

                        />
                    </View>

                </TouchableOpacity>
                <Divider style={{ backgroundColor: '#e5e5e5',height:moderateScale(1,0.1),marginTop:moderateScale(10,0.1) }} />
            </View>
        )
    }

    async requestLocationPermission() 
    {
        try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                       
                )
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("You can use the location")
                    this.refresh()
                    } 
                else {
                    console.log("location permission denied")
                   
                }
        } catch (err) {
            console.warn(err)
        }
    }

    async componentDidMount(){
        await this.requestLocationPermission()
        
    }
    toCelsius(fahrenheit) {
        return Math.floor((fahrenheit- 273.15));
    }

    refresh=()=>{
        this.setState({refreshing:true})
        Geolocation.getCurrentPosition(
            (position) => {
                console.log(position);
                let location={
                                lat:position.coords.latitude,
                                lng:position.coords.longitude
                          }
                Geocoder.geocodePosition(location).then(res => {
                    console.log(res)
                    this.setState({
                        city:res[0].locality,
                        country:res[0].country,
                        countrycode:res[0].countryCode
                    },()=>{
                        let params={
                            q:this.state.city+','+this.state.country,
                            APPID:'5f46e53c25adb6341d89382a5694f01c'
                        }
                       API.getweather(params,(cb)=>{
                           
                           this.setState({
                               data:cb.data.list,
                               
                           },()=>{
                            this.setState({refreshing:false,
                                todayData:this.state.data[0]},()=>{
                                    this.setState({
                                        todayWeather:this.state.todayData.weather[0].description,
                                        todayTemp:this.toCelsius(this.state.todayData.main.temp)
                                    })
                                })
                           })
                           console.log(cb.data.list)
                       })
                        
                    })
                })
                .catch(err => console.log(err))
            },
            (error) => {
                // See error code charts below.
                console.log(error.code, error.message);
                this.dropdown.alertWithType('error', 'Error', error.message)
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
        
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <StatusBar backgroundColor='#ff0000' barStyle='light-content' />                
                <View style={{ height: '5%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ff0000' }}>
                    {this.state.refreshing?
                        <ActivityIndicator size={moderateScale(10,0.1)} color="#fff" />:
                    <Text style={{ color: '#fff', fontSize: moderateScale(12,0.1) }}>{this.state.city}, {this.state.country}</Text>
                    }
                    
                </View>
                {this.state.refreshing?<View style={{ height: '20%', alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size={moderateScale(50,0.1)} color="#000" />
                </View>:
                <View style={{ height: verticalScale(150), alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: moderateScale(15,0.1), color: '#000', fontWeight: 'bold' }}>{moment(this.state.todayData.dt_txt).format('ddd, DD MMM YYYY hh:mm A')}</Text>
                    <Text style={{ fontSize: moderateScale(45,0.1), color: '#000', fontWeight: 'bold',paddingTop:5 }}>{this.state.todayTemp}°C</Text>
                    <Text style={{ fontSize: moderateScale(15,0.1), color: '#a9a9a9' }}>{this.state.todayWeather}</Text>
                </View>}
                    <FlatList
                        refreshing={this.state.refreshing}
                        onRefresh={this.refresh}
                        data={this.state.data}
                        renderItem={this.renderItem}
                        keyExtractor={(item,index) => item.dt.toString()}
                    />
                    <DropdownAlert ref={ref => this.dropdown = ref} />
            </View>
        )
    }
}

export default MainScreen
