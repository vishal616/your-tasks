import { IonContent, IonHeader, IonPage,IonFabButton,IonFab, IonTitle, IonToolbar, IonButton,IonInput,
    IonModal, IonFooter, IonItem, IonLabel,IonCheckbox,IonRow,IonList,IonListHeader,IonTextarea, IonIcon, IonReorder} from '@ionic/react';
import React, {useState, useEffect, Component} from 'react';
import './Tasks.css';
import {add, checkbox, checkmarkCircleOutline, options, save, text, trash} from "ionicons/icons";
import { Plugins, KeyboardInfo } from '@capacitor/core';
import {LongPressModule} from "ionic-long-press";
import { SwipeableList, SwipeableListItem } from '@sandstreamdev/react-swipeable-list';
import '@sandstreamdev/react-swipeable-list/dist/styles.css';
const { Keyboard } = Plugins;
const { Storage } = Plugins;

export interface IState {
    showModal:any;
    newTask:any;
    toDoList:any;
    oldList:any;
    completedList:any;
    showButton:any;
    showUpdateModal:any;
    updateTask:any;
    showUpdateButton:any;

}
class Tasks extends React.Component<any,IState>{
    constructor(props:any){
        super(props);
        this.state={
            showModal:false,
            showButton:false,
            showUpdateButton:false,
            updateTask:{},
            showUpdateModal:false,
            newTask:{},
            toDoList:[],
            oldList:[],
            completedList:[]
        }
    }
    public componentDidMount(){
        const self=this;
        let todoList: any=[];
        let completedList:any=[];

        async function getData() {
            todoList = await Storage.get({key: 'ToDoList'});
            completedList = await Storage.get({key: 'CompletedList'});
            todoList=JSON.parse(todoList.value);
            completedList=JSON.parse(completedList.value);

            if(todoList){
                self.setState({toDoList:todoList});
                console.log('get to do state', self.state.toDoList);
            }
            if(completedList){
                self.setState({completedList:completedList})
                console.log('get to do state', self.state.completedList);
            }

        }
        getData();

    }

    public async setItemToSaveInDb() {
        const ToDoList:any = JSON.stringify(this.state.toDoList);
        const CompletedList:any = JSON.stringify(this.state.completedList);
        // await Storage.remove({
        //     key: 'ToDoList'
        // })
        // await Storage.remove({
        //     key: 'CompletedList'
        // })
         await Storage.set({
            key: 'ToDoList',
            value: ToDoList
        })
        await Storage.set({
            key: 'CompletedList',
            value: CompletedList
        })
    }

    public saveTask=()=>{
        let list:any=[...this.state.toDoList];
        list.push(this.state.newTask);
            const sortedList:any = list.sort((a:any, b:any) =>{
                return(new Date(b.date).valueOf()- new Date(a.date).valueOf())
            })
        this.setState({toDoList:sortedList},() => {
            this.setItemToSaveInDb();
        })
        this.setState({showModal:false});
        this.setState({showButton:false})

    }
    public handleInputChange=(event:any)=>{
        if(event.target.value.length){
            this.setState({showButton:true})
        }
        let object = {id:'',name:'',date:JSON.parse(JSON.stringify(new Date().toString()))};
        object.id=Math.random().toString();
        object.name=event.target.value;
        this.setState({newTask:object})
    }

    public setTaskToComplete=((taskObjet:any)=>{

        let index:any=null;
        this.state.toDoList.forEach((item:any,i:any)=>{
            if(taskObjet.task.name === item.name) {
                index = i;
            }
        })
        if (index > -1) {
            let toDolist:any=[...this.state.toDoList];
            let completedItemsList:any=[...this.state.completedList];
            let obj= toDolist[index];
            obj.date = new Date();
            completedItemsList.push(obj);
            toDolist.splice(index, 1);
            this.setState({toDoList:toDolist})
            const sortedList:any = completedItemsList.sort((a:any, b:any) =>{
                return(new Date(b.date).valueOf()- new Date(a.date).valueOf())
            })
            this.setState({completedList:sortedList},()=>{this.setItemToSaveInDb()});
        }
    })
    public setTaskToToDo=((taskObjet:any)=>{
        let index:any=null;
        this.state.completedList.forEach((item:any,i:any)=>{
            if(taskObjet.task2.name === item.name) {
                index = i;
            }
        })
        if (index > -1) {
            let toDolist:any=[...this.state.toDoList];
            let completedItemsList:any=[...this.state.completedList];
            let obj= completedItemsList[index];
            obj.date = new Date();
            toDolist.push(obj);
            completedItemsList.splice(index, 1);
            this.setState({completedList:completedItemsList})
            const sortedList:any = toDolist.sort((a:any, b:any) =>{
                return(new Date(b.date).valueOf()- new Date(a.date).valueOf())
            })
            this.setState({toDoList:sortedList},()=>{this.setItemToSaveInDb()});
        }
    })

    public deleteItemFromToDoList=(taskObject:any)=>{
        console.log('delete', taskObject.task)
        let index:any=null;
        this.state.toDoList.forEach((item:any,i:any)=>{
            if(taskObject.task.name === item.name) {
                index = i;
            }
        })
        if (index > -1) {
            let toDolist:any=[...this.state.toDoList];
            toDolist.splice(index, 1);
            this.setState({toDoList:toDolist},()=>{this.setItemToSaveInDb()});
        }

}
    public deleteItemFromCompletedList=(taskObject:any)=>{
        console.log('delete', taskObject.task2)
        let index:any=null;
        this.state.completedList.forEach((item:any,i:any)=>{
            if(taskObject.task2.name === item.name) {
                index = i;
            }
        })
        if (index > -1) {
            let completedItemsList:any=[...this.state.completedList];
            completedItemsList.splice(index, 1);
            this.setState({completedList:completedItemsList},()=>{this.setItemToSaveInDb()});
        }
    }

    render() {
        return (
            <IonPage className='app'>
                <IonHeader>
                    <IonToolbar className='header-class'>
                        <h2 style={{textAlign: "center"}}>Your Tasks</h2>
                    </IonToolbar>
                </IonHeader>
                <h4 style={{marginLeft: "2.5rem", color: "white"}}>To Do</h4>
                <span className='line'></span>
                <IonContent className='item-background'>
                    <SwipeableList>
                        {this.state.toDoList.map((task: any) => {
                            return (
                                <div className='swipe-container'>
                                <SwipeableListItem key={task+Math.random()}
                                    swipeRight={{
                                        content: <div style={{display:"flex",flexDirection:'row',alignItems:'center',width:'inherit',height:'inherit'}}>
                                            <i className="fa fa-trash fa-2x delete-icon" aria-hidden="true"></i>
                                            <span className='swipe-right'><i className="fa fa-trash fa-3x" aria-hidden="true"></i></span>
                                        </div>,
                                        action: () => {this.deleteItemFromToDoList({task})}
                                    }}
                                    onSwipeProgress={progress => console.info()}
//                                    `Swipe progress: ${progress}%`
                                >
                                    <div style={{display:"flex",flexDirection:'column',verticalAlign:'center',alignItems:'flex-start',width:'inherit',backgroundColor:'#3e3e3e'}}>
                                        <div style={{display:"flex",flexDirection:'row',width:'inherit',alignItems:'center', verticalAlign:'center'}}>
                                        <IonCheckbox onIonChange={()=>this.setTaskToComplete({task})} className='check-box ion-margin-horizontal' checked={false}/>
                                    <div className='item-todo'>{task.name}</div>
                                        </div>
                                    <div className='bottom-border'></div>
                                    </div>
                                </SwipeableListItem>
                                </div>
                            )
                        })}
                        </SwipeableList>
                </IonContent>
                <h4 style={{marginLeft: "2.5rem", color: "white"}}>Completed</h4>
                <span className='line'></span>
                <IonContent className='item-background'>
                    <SwipeableList>
                        {this.state.completedList.map((task2: any) => {
                            return (
                                <div className='swipe-container'>
                                    <SwipeableListItem key={task2 + task2 +Math.random()}
                                        swipeRight={{
                                            content: <div style={{display:"flex",flexDirection:'row',alignItems:'center',width:'inherit',height:'inherit'}}>
                                                <i className="fa fa-trash fa-2x delete-icon" aria-hidden="true"></i>
                                                <span className='swipe-right'><i className="fa fa-trash fa-3x" aria-hidden="true"></i></span>
                                            </div>,
                                            action: () => {this.deleteItemFromCompletedList({task2})}
                                        }}
                                        onSwipeProgress={progress => console.info()}
                                        //                                    `Swipe progress: ${progress}%`
                                    >
                                        <div style={{display:"flex",flexDirection:'column',verticalAlign:'center',alignItems:'flex-start',width:'inherit',backgroundColor:'#3e3e3e'}}>
                                            <div style={{display:"flex",flexDirection:'row',width:'inherit',alignItems:'center', verticalAlign:'center'}}>
                                                <IonCheckbox onIonChange={()=>this.setTaskToToDo({task2})} className='check-box ion-margin-horizontal' checked={true}/>
                                                <div className='item-todo'>{task2.name}</div>
                                            </div>
                                            <div className='bottom-border'></div>
                                        </div>
                                    </SwipeableListItem>
                                </div>
                            )
                        })}
                    </SwipeableList>
                </IonContent>
                <IonFab className="floating-button" vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => {
                        this.setState({showModal:true})
                    }}>
                        <IonIcon icon={add}></IonIcon>
                    </IonFabButton>
                </IonFab>
                <IonModal onDidDismiss={() => {
                    this.setState({showModal:false, newTask:{},showButton:false})
                }} cssClass='input-modal' isOpen={this.state.showModal}>
                    <IonContent>
                        <div className='flex-box'>
                            <IonTextarea onIonChange={this.handleInputChange} placeholder="New Task" autoGrow={true}
                                         class='input-value'> </IonTextarea>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                marginRight: '20px',
                                marginTop: '25px'
                            }}>
                                <button className="save-button" style={this.state.showButton?{display:'block'}:{display:'none'}} onClick={this.saveTask}>Save</button>
                            </div>
                        </div>
                    </IonContent>
                </IonModal>
                <IonFooter>
                    <IonToolbar className='header-class'>
                        <IonTitle class="ion-text-center font-size">What is not started today is never finished
                            tomorrow</IonTitle>
                    </IonToolbar>
                </IonFooter>
                <link rel="stylesheet"
                      href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.2/animate.min.css"></link>
                <link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
                      rel="stylesheet"
                      integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN"
                      crossOrigin="anonymous"></link>
            </IonPage>

        );
    }
};

export default Tasks;
