import {
    IonContent, IonHeader, IonPage, IonFabButton, IonFab, IonTitle, IonToolbar, IonButton, IonInput,
    IonModal, IonItemDivider, IonAlert,
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

const Hammer = require("react-hammerjs").default;

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
    placeholder: any;
    formMode: any;
    oldTask: any;
    listType: any;
    showAlert: any;
    deleteTasK: any;
    deleteTypeList: any;
}

class Tasks extends React.Component<any, IState> {
    public options: any = {
        touchAction: 'compute',
        recognizers: {
            tap: {
                time: 600,
                threshold: 100
            }
        }
    };

    constructor(props: any) {
        super(props);
        this.state = {
            showModal: false,
            showButton: false,
            showUpdateButton: false,
            updateTask: {},
            showUpdateModal: false,
            deleteTasK: {},
            newTask: {},
            oldTask: '',
            listType: '',
            deleteTypeList: '',
            toDoList: [],
            oldList: [],
            completedList: [],
            placeholder: 'New Task',
            formMode: 'create',
            showAlert: false
        }
    }

    public componentDidMount() {
        const self = this;
        let todoList: any = [];
        let completedList: any = [];

        async function getData() {
            todoList = await Storage.get({key: 'ToDoList'});
            completedList = await Storage.get({key: 'CompletedList'});
            todoList = JSON.parse(todoList.value);
            completedList = JSON.parse(completedList.value);

            if (todoList) {
                self.setState({toDoList: todoList});
                console.log('get to do state', self.state.toDoList);
            }
            if (completedList) {
                self.setState({completedList: completedList})
                console.log('get to do state', self.state.completedList);
            }

        }

        getData();

    }

    public async setItemToSaveInDb() {
        const ToDoList: any = JSON.stringify(this.state.toDoList);
        const CompletedList: any = JSON.stringify(this.state.completedList);
        await Storage.remove({
            key: 'ToDoList'
        })
        await Storage.remove({
            key: 'CompletedList'
        })
        await Storage.set({
            key: 'ToDoList',
            value: ToDoList
        })
        await Storage.set({
            key: 'CompletedList',
            value: CompletedList
        })
    }

    public sortList = (list: any) => {
        list.sort((a: any, b: any) => {
            return (new Date(b.date).valueOf() - new Date(a.date).valueOf())
        })
    }

    public saveTask = () => {
        const taskName:any=this.state.newTask.name?this.state.newTask.name:'';
        if (taskName.length>0) {
            let list: any = [...this.state.toDoList];
            list.push(this.state.newTask);
            this.sortList(list);
            this.setState({toDoList: list}, () => {
                this.setItemToSaveInDb();
            })
            this.setState({showModal: false, showButton: false});
        } else {
            this.setState({placeholder: "Please Enter Some Text"})
        }
    }

    public handleInputChange = (event: any) => {
        let object = {
            id: '',
            name: '',
            date: JSON.parse(JSON.stringify(new Date().toString()))
        };

        object.id = Math.random().toString();
        object.name = event.target.value;
        this.setState({newTask: object});
    }

    public setTaskToComplete = ((taskObject: any) => {
        let index: any = null;
        this.state.toDoList.forEach((item: any, i: any) => {
            if (taskObject.name === item.name) {
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
            this.sortList(completedItemsList);
            this.setState({completedList: completedItemsList}, () => {
                this.setItemToSaveInDb();
            });
        }
    })
    public setTaskToToDo = ((taskObject: any) => {
        let index: any = null;
        this.state.completedList.forEach((item: any, i: any) => {
            if (taskObject.name === item.name) {
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
            this.sortList(toDolist);
            this.setState({toDoList: toDolist}, () => {
                this.setItemToSaveInDb();
            });
        }
    })

    public deleteItemFromToDoList = (taskObject: any) => {
        let index: any = null;
        this.state.toDoList.forEach((item: any, i: any) => {
            if (taskObject.name === item.name) {
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
        let index: any = null;
        this.state.completedList.forEach((item: any, i: any) => {
            if (taskObject.name === item.name) {
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

    public updateTask = () => {
        const taskName:any=this.state.newTask.name?this.state.newTask.name:'';
        if(taskName.length>0) {
            let listType: any = this.state.listType === 'ToDo' ? this.state.toDoList : this.state.completedList;
            listType.forEach((task: any) => {
                if (task.name === this.state.oldTask) {
                    task.name = this.state.newTask.name;
                }
            });
            this.setState({showModal: false})
            this.setItemToSaveInDb();
        } else {
            this.setState({placeholder: "Please Enter Some Text"})
        }
    }

    public updateToDoTask = (task: any, listType: any) => {
        this.setState({
            newTask: task,
            showModal: true,
            formMode: 'update',
            oldTask: JSON.parse(JSON.stringify(task.name)),
            listType: listType
        });

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
                                <Hammer onPressUp={() => {
                                    this.setState({showAlert: true, deleteTasK: task, deleteTypeList: 'ToDo'})
                                }} options={options}>
                                    <div>
                                        <IonItem button onClick={() => {
                                            this.updateToDoTask(task, 'ToDo')
                                        }} key={task.id + Math.random()}>
                                            <IonCheckbox onIonChange={() => {
                                                this.setTaskToComplete(task)
                                            }} className='check-box' checked={false} color='primary'/>
                                            <IonLabel color='secondary' className='ion-text-wrap ion-margin-start'>
                                                {task.name}
                                            </IonLabel>
                                        </IonItem>
                                    </div>
                                </Hammer>
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
                                <Hammer onPressUp={() => {
                                    this.setState({showAlert: true, deleteTasK: task, deleteTypeList: 'Completed'})
                                }} options={options}>
                                    <div>
                                        <IonItem button key={task.id + Math.random()}>
                                            <IonCheckbox onIonChange={() => {
                                                this.setTaskToToDo(task)
                                            }} className='check-box' checked={true} color='primary'/>
                                            <IonLabel color='secondary' className='ion-text-wrap ion-margin-start'>
                                                <del>{task.name}</del>
                                            </IonLabel>
                                        </IonItem>
                                    </div>
                                </Hammer>
                            )
                        })
                        }
                    </IonList>
                </IonContent>
                <IonModal onDidDismiss={() => {
                    this.setState({showModal: false, newTask: {}, placeholder: "New Task", formMode: 'create'})
                }} cssClass='input-modal' isOpen={this.state.showModal}>
                    <IonContent>
                        <div className='flex-box'>
                            <IonTextarea value={this.state.newTask.name} onIonChange={this.handleInputChange}
                                         placeholder={this.state.placeholder} autoGrow={true}
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
                   <button className="save-button"
                           onClick={this.state.formMode === 'create' ? this.saveTask : this.updateTask}>Save</button>
                   </span>
                </IonModal>
                <IonFab className="fab-bottom-margin" vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton className='fab-color' onClick={() => {
                        this.setState({showModal: true})
                    }}>
                        <IonIcon icon={add}></IonIcon>
                    </IonFabButton>
                </IonFab>
                <IonFooter>
                    <IonToolbar className='toolbar-height'>
                        <IonTitle color="primary">
                            <p className="ion-text-center toolbar-title"> What is not started today is never finished
                                tomorrow</p>
                        </IonTitle>
                    </IonToolbar>
                </IonFooter>
                <IonAlert
                    isOpen={this.state.showAlert}
                    onDidDismiss={() => this.setState({showAlert: false})}
                    header={'Delete'}
                    message={'Are You Sure ?'}
                    buttons={[
                        {
                            text: 'Cancel',
                        },
                        {
                            text: 'Okay',
                            handler: () => {
                                this.state.deleteTypeList === 'ToDo' ?
                                    this.deleteItemFromToDoList(this.state.deleteTasK) :
                                    this.deleteItemFromCompletedList(this.state.deleteTasK);
                            }
                        }
                    ]}
                />
            </IonPage>

        )
    }
}

export default Tasks;
