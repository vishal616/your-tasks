import {
    IonContent, IonHeader, IonPage, IonFabButton, IonFab, IonTitle, IonToolbar, IonButton, IonInput,
    IonModal, IonItemDivider, IonAlert,
    IonItemSliding, IonItemOption, IonItemOptions, IonNote,
    IonFooter, IonItem, IonLabel, IonCheckbox, IonRow, IonList, IonListHeader, IonTextarea, IonIcon, IonReorder
} from '@ionic/react';
import React, {useState, useEffect, Component} from 'react';
import './Tasks.css';
import {
    add,
    caretDownOutline,
    caretUpOutline,
    checkbox,
    checkmarkCircleOutline,
    options,
    save,
    text,
    trash
} from "ionicons/icons";
import {Plugins,HapticsImpactStyle} from '@capacitor/core';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import '@sandstreamdev/react-swipeable-list/dist/styles.css';
import Collapsible from 'react-collapsible';
import {faCheck} from "@fortawesome/free-solid-svg-icons";
const Hammer = require("react-hammerjs").default;

const {Keyboard} = Plugins;
const {Storage} = Plugins;
const {Haptics} = Plugins;

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
    toDoCollapse:any;
    completedCollapse:any;
    undoAlert:any;
    undoMessage:any;
    undoObject:any;
}

class Tasks extends React.Component<any, IState> {
    public options: any = {
        touchAction: 'compute',
        recognizers: {
            tap: {
                time: 500,
                threshold: 100
            }
        }
    };
    public subscribe:any;
    public input:any;
    constructor(props: any) {
        super(props);
        Keyboard.setScroll({isDisabled:true});
        this.state = {
            toDoCollapse:true,
            completedCollapse:false,
            showModal: false,
            showButton: false,
            undoAlert:false,
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
            showAlert: false,
            undoMessage:null,
            undoObject:{}
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
            }
            if (completedList) {
                self.setState({completedList: completedList})
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
            this.setState({showModal: false, showButton: false,toDoCollapse:true});
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
            this.setState({completedList: completedItemsList,completedCollapse:true,undoAlert:true,
            undoMessage:'1 task moved to completed', undoObject:obj
            }, () => {
                this.setItemToSaveInDb();
            });
            this.showUndoForSomeTime();
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
            this.setState({toDoList: toDolist,toDoCollapse:true,undoAlert:true,
                undoMessage:'1 task moved to to do', undoObject:obj
            }, () => {
                this.setItemToSaveInDb();
            });
            this.showUndoForSomeTime();
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
            this.setState({toDoList: toDolist, undoAlert:true}, () => {
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
            this.setState({completedList: completedItemsList, undoAlert:true,
            }, () => {
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
            this.setState({showModal: false, toDoCollapse:true})
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

    public changeIconStateToDown=()=>{
        const element:any = document.getElementById('to-do-icon');
        element.classList.remove('icon-animation-down-2');
        element.classList.add('icon-animation-up-2');
    }
    public changeIconStateToDownForCompleted=()=>{
        const element:any = document.getElementById('completed-icon');
        element.classList.remove('icon-animation-up');
        element.classList.add('icon-animation-down');
    }

    public changeIconStateToUp=()=>{
        const element:any = document.getElementById('to-do-icon');
        element.classList.remove('icon-animation-up-2');
        element.classList.add('icon-animation-down');
    }
    public changeIconStateToUpForCompleted=()=>{
        const element:any = document.getElementById('completed-icon');
        element.classList.remove('icon-animation-down');
        element.classList.add('icon-animation-up');
    }
    public showUndoForSomeTime=()=>{
        const element:any = document.getElementById('undo');
        setTimeout(()=>{element.style.display='none'},5000);
        element.removeAttribute("style");
    }

    public performUndo=()=>{
        const undoType:any=this.state.undoMessage;
        const element:any = document.getElementById('undo');
        if(undoType === '1 task moved to completed'){
            this.setTaskToToDo(this.state.undoObject);
            element.style.display='none';
        }
        else if (undoType === '1 task moved to to do'){
            this.setTaskToComplete(this.state.undoObject);
            element.style.display='none';
        }
    }

    render() {
        const Trigger = () => <div className="list-title">
            <h3>To Do</h3>
            <IonIcon id='to-do-icon' icon={caretUpOutline}></IonIcon>
        </div>;
        const CompleteTrigger = () => <div className="list-title">
            <h3>Completed({this.state.completedList.length})</h3>
            <IonIcon id='completed-icon' icon={caretDownOutline}></IonIcon>
        </div>;
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar className='ion-text-center toolbar-height'>
                        <IonLabel color="primary"><h1 style={{fontSize:'30px'}}>Your Tasks</h1></IonLabel>
                    </IonToolbar>
                </IonHeader>

                <IonContent className="ion-margin-top">
                    <Collapsible onOpening={this.changeIconStateToUp}
                                  onClosing={this.changeIconStateToDown}
                        trigger={<Trigger/>} triggerStyle={{fontSize:"25px", marginLeft:"16px"}}
                                 open={this.state.toDoCollapse}>
                        <div className='line'></div>
                        {this.state.toDoList.length?
                    <IonList>
                        {this.state.toDoList.map((task: any) => {
                            return (
                                <Hammer onPressUp={() => {
                                    Haptics.impact({style:HapticsImpactStyle.Light});
                                    this.setState({showAlert: true, deleteTasK: task, deleteTypeList: 'ToDo'})
                                }} options={options}>
                                    <div>
                                        <IonItem  button onClick={() => {
                                            this.updateToDoTask(task, 'ToDo')
                                        }} key={task.id + Math.random()}>
                                            <div onClick={(e) => {
                                                e.stopPropagation()
                                                this.setTaskToComplete(task)
                                            }} className="outer">
                                                <div className="inner-unchecked"></div>
                                            </div>
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
                            :
                            <div className='empty'>
                                <h2>A fresh Start</h2>
                                <h5>Anything to add ?</h5>
                            </div>
                        }
                    </Collapsible>

                    <Collapsible onOpening={this.changeIconStateToUpForCompleted}
                                 onClosing={this.changeIconStateToDownForCompleted}
                                 trigger={<CompleteTrigger/>} triggerStyle={{fontSize:"25px", marginLeft:"16px"}}
                                 open={this.state.completedCollapse}>
                        <div className='line'></div>
                    <IonList>
                        {this.state.completedList.map((task: any) => {
                            return (
                                <Hammer onPressUp={() => {
                                    Haptics.impact({style:HapticsImpactStyle.Light});
                                    this.setState({showAlert: true, deleteTasK: task, deleteTypeList: 'Completed'})
                                }} options={options}>
                                    <div>
                                        <IonItem button key={task.id + Math.random()}>
                                            <div onClick={() => {
                                                this.setTaskToToDo(task)
                                            }} className="outer">
                                                <div className="inner-checked">
                                                    <FontAwesomeIcon icon={faCheck} size="xs"
                                                                     className="icon-style" color="white"
                                                    /></div>
                                            </div>
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
                    </Collapsible>
                </IonContent>
                <IonModal onDidDismiss={() => {
                    this.setState({showModal: false, newTask: {}, placeholder: "New Task", formMode: 'create'});
                }} cssClass='input-modal' isOpen={this.state.showModal}>
                    <IonContent>
                        <div className='flex-box'>
                            <IonTextarea autofocus inputMode="text" value={this.state.newTask.name} onIonChange={this.handleInputChange}
                                         placeholder={this.state.placeholder} autoGrow={true}
                                         class='input-value' onIonFocus={()=>{}} ></IonTextarea>
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
                    <div className='save-button-position'>
                   <button className="save-button"
                           onClick={this.state.formMode === 'create' ? this.saveTask : this.updateTask}>Save</button>
                   </div>
                </IonModal>
                <IonFab className="fab-bottom-margin" vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton className='fab-color' onClick={() => {
                        this.setState({showModal: true});
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
                    message={'<h3>Are You Sure ?</h3>'}
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
                                this.setState({undoAlert:true})
                            }
                        }
                    ]}
                />
                    <div id='undo' className='undo-alert' style={this.state.undoAlert? {display:'block'}:{display:'none'}}>
                        <div className="undo-message">{this.state.undoMessage}</div>
                        <button className='undo-button' onClick={this.performUndo}>Undo</button>

                    </div>
            </IonPage>

        )
    }
}

export default Tasks;
