import {
    IonContent, IonHeader, IonPage, IonFabButton, IonFab, IonTitle, IonToolbar, IonButton, IonInput,
    IonModal, IonItemDivider,
    IonItemSliding, IonItemOption, IonItemOptions, IonNote,
    IonFooter, IonItem, IonLabel, IonCheckbox, IonRow, IonList, IonListHeader, IonTextarea, IonIcon, IonReorder
} from '@ionic/react';
import React, {useState, useEffect, Component} from 'react';
import './Tasks.css';
import {add, checkbox, checkmarkCircleOutline, options, save, text, trash} from "ionicons/icons";
import {Plugins, KeyboardInfo} from '@capacitor/core';
import {LongPressModule} from "ionic-long-press";
import {SwipeableList, SwipeableListItem} from '@sandstreamdev/react-swipeable-list';
import '@sandstreamdev/react-swipeable-list/dist/styles.css';

const {Keyboard} = Plugins;
const {Storage} = Plugins;

export interface IState {
    showModal: any;
    newTask: any;
    toDoList: any;
    oldList: any;
    completedList: any;
    showButton: any;
    showUpdateModal: any;
    updateTask: any;
    showUpdateButton: any;

}

class Tasks extends React.Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            showModal: false,
            showButton: false,
            showUpdateButton: false,
            updateTask: {},
            showUpdateModal: false,
            newTask: {},
            toDoList: ['1dsvdsvdsvdsvdssefsdffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff','2','3','4','5','6','7','8','9','10'],
            oldList: [],
            completedList: ['1','2','3','4','5','6','7','8','9','10']
        }
    }

    public componentDidMount() {
        const self = this;
        let todoList: any = [];
        let completedList: any = [];

        // async function getData() {
        //     todoList = await Storage.get({key: 'ToDoList'});
        //     completedList = await Storage.get({key: 'CompletedList'});
        //     todoList = JSON.parse(todoList.value);
        //     completedList = JSON.parse(completedList.value);
        //
        //     if (todoList) {
        //         self.setState({toDoList: todoList});
        //         console.log('get to do state', self.state.toDoList);
        //     }
        //     if (completedList) {
        //         self.setState({completedList: completedList})
        //         console.log('get to do state', self.state.completedList);
        //     }
        //
        // }
        //
        // getData();

    }

    public async setItemToSaveInDb() {
        const ToDoList: any = JSON.stringify(this.state.toDoList);
        const CompletedList: any = JSON.stringify(this.state.completedList);
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

    public saveTask = () => {
        let list: any = [...this.state.toDoList];
        list.push(this.state.newTask);
        const sortedList: any = list.sort((a: any, b: any) => {
            return (new Date(b.date).valueOf() - new Date(a.date).valueOf())
        })
        this.setState({toDoList: sortedList}, () => {
            this.setItemToSaveInDb();
        })
        this.setState({showModal: false});
        this.setState({showButton: false})

    }
    public handleInputChange = (event: any) => {
        if (event.target.value.length) {
            this.setState({showButton: true})
        }
        let object = {id: '', name: '', date: JSON.parse(JSON.stringify(new Date().toString()))};
        object.id = Math.random().toString();
        object.name = event.target.value;
        this.setState({newTask: object})
    }

    public setTaskToComplete = ((taskObjet: any) => {

        let index: any = null;
        this.state.toDoList.forEach((item: any, i: any) => {
            if (taskObjet.task.name === item.name) {
                index = i;
            }
        })
        if (index > -1) {
            let toDolist: any = [...this.state.toDoList];
            let completedItemsList: any = [...this.state.completedList];
            let obj = toDolist[index];
            obj.date = new Date();
            completedItemsList.push(obj);
            toDolist.splice(index, 1);
            this.setState({toDoList: toDolist})
            const sortedList: any = completedItemsList.sort((a: any, b: any) => {
                return (new Date(b.date).valueOf() - new Date(a.date).valueOf())
            })
            this.setState({completedList: sortedList}, () => {
                this.setItemToSaveInDb()
            });
        }
    })
    public setTaskToToDo = ((taskObjet: any) => {
        let index: any = null;
        this.state.completedList.forEach((item: any, i: any) => {
            if (taskObjet.task2.name === item.name) {
                index = i;
            }
        })
        if (index > -1) {
            let toDolist: any = [...this.state.toDoList];
            let completedItemsList: any = [...this.state.completedList];
            let obj = completedItemsList[index];
            obj.date = new Date();
            toDolist.push(obj);
            completedItemsList.splice(index, 1);
            this.setState({completedList: completedItemsList})
            const sortedList: any = toDolist.sort((a: any, b: any) => {
                return (new Date(b.date).valueOf() - new Date(a.date).valueOf())
            })
            this.setState({toDoList: sortedList}, () => {
                this.setItemToSaveInDb()
            });
        }
    })

    public deleteItemFromToDoList = (taskObject: any) => {
        console.log('delete', taskObject.task)
        let index: any = null;
        this.state.toDoList.forEach((item: any, i: any) => {
            if (taskObject.task.name === item.name) {
                index = i;
            }
        })
        if (index > -1) {
            let toDolist: any = [...this.state.toDoList];
            toDolist.splice(index, 1);
            this.setState({toDoList: toDolist}, () => {
                this.setItemToSaveInDb()
            });
        }

    }
    public deleteItemFromCompletedList = (taskObject: any) => {
        console.log('delete', taskObject.task2)
        let index: any = null;
        this.state.completedList.forEach((item: any, i: any) => {
            if (taskObject.task2.name === item.name) {
                index = i;
            }
        })
        if (index > -1) {
            let completedItemsList: any = [...this.state.completedList];
            completedItemsList.splice(index, 1);
            this.setState({completedList: completedItemsList}, () => {
                this.setItemToSaveInDb()
            });
        }
    }

    render() {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar className='ion-text-center toolbar-height'>
                        <IonLabel color="primary"><h1>Your Tasks</h1></IonLabel>
                    </IonToolbar>
                </IonHeader>

                <IonItemDivider className='divider ion-margin-start'>
                    <p className='p-headings'>To Do</p>
                </IonItemDivider>
                <IonContent>
                    <IonList>
                        {this.state.toDoList.map((task: any) => {
                            return (
                                <IonItemSliding>
                                    <IonItemOptions side="start">
                                        <IonItemOption  key={task+task+Math.random()}
                                                        onClick={() => console.log('unread clicked')}
                                                       color="danger"
                                                       expandable>
                                            <IonIcon size='small' icon={trash}></IonIcon>
                                        </IonItemOption>
                                    </IonItemOptions>

                                    <IonItem>
                                        <IonCheckbox className='check-box' checked={false} color='primary'/>
                                        <IonLabel color='secondary' className='ion-text-wrap ion-margin-start'>
                                            {task}
                                        </IonLabel>
                                    </IonItem>
                                </IonItemSliding>
                            )
                        })
                        }
                    </IonList>
                </IonContent>

                <IonItemDivider className='divider ion-margin-start'>
                    <p className='p-headings'>Completed</p>
                </IonItemDivider>

                <IonContent>
                    <IonList>
                        {this.state.completedList.map((task: any) => {
                            return (
                                <IonItemSliding>
                                    <IonItemOptions side="start">
                                        <IonItemOption key={task+Math.random()}
                                                        onClick={() => console.log('unread clicked')}
                                                       color="danger"
                                                       expandable>
                                            <IonIcon size='small' icon={trash}></IonIcon>
                                        </IonItemOption>
                                    </IonItemOptions>

                                    <IonItem>
                                        <IonCheckbox className='check-box' checked={true} color='primary'/>
                                        <IonLabel color='secondary' className='ion-text-wrap ion-margin-start'>{task}</IonLabel>
                                    </IonItem>
                                </IonItemSliding>
                            )
                        })
                        }
                    </IonList>
                </IonContent>
                <IonModal onDidDismiss={() => {
                    this.setState({showModal:false, newTask:{},showButton:false})
                }} cssClass='input-modal' isOpen={this.state.showModal}>
                    <IonContent>
                        <div className='flex-box'>
                            <IonTextarea onIonChange={this.handleInputChange} placeholder="New Task" autoGrow={true}
                                         class='input-value'></IonTextarea>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                marginRight: '20px',
                                marginTop: '25px'
                            }}>
                            </div>
                        </div>
                    </IonContent>
                   <span className='save-button-position'>
                   <button className="save-button" style={this.state.showButton?{display:'block'}:{display:'none'}} onClick={this.saveTask}>Save</button>
                   </span>
                </IonModal>
                <IonFab className="fab-bottom-margin" vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton className='fab-color' onClick={() => {
                        this.setState({showModal:true})
                    }}>
                        <IonIcon icon={add}></IonIcon>
                    </IonFabButton>
                </IonFab>
                <IonFooter>
                    <IonToolbar className='toolbar-height'>
                        <IonTitle color="primary">
                            <p className="ion-text-center toolbar-title"> What is not started today is never finished tomorrow</p>
                        </IonTitle>
                    </IonToolbar>
                </IonFooter>

            </IonPage>

        )
    }
}

export default Tasks;
