import React from "react";
import { Provider, observer } from "mobx-react";
import { observable, reaction, computed, extendObservable } from "mobx";

const add = a => {
    return b => {
        return a + b;
    };
};

const addIn10 = add(10);

const val1 = addIn10(5);

class Store {
    loadingData = false;
    @observable qty = 0;
    @observable rate = 0;
    @observable amount = 0;

    @computed get cAmount() {
        console.log("c : qty >>", this.qty);
        console.log("c: rate>>", this.rate);
        if (!this.loadingData) {
            return this.qty * this.rate;
        } else {
            return this.amount;
        }
    }

    setValues({ qty, rate, amount }) {
        this.loadingData = true;
        this.qty = qty;
        this.rate = rate;
        this.amount = amount;
        this.loadingData = false;
    }

    constructor() {
        var disposer = reaction(
            () => {
                console.log("a : qty >>", this.qty);
                console.log("a: rate>>", this.rate);
                return this.qty * this.rate;
            },
            amt => {
                console.log("amt >>>>", amt);
                console.log("this.loading>>>>", this.loadingData);
                if (!this.loadingData) {
                    this.amount = amt;
                }
            },
            {}
        );
    }
}

const store = new Store();

const mstore = observable.object({});

// mstore["name"] = "rohit bansal";

extendObservable(mstore, { name: undefined });

@observer class TextInput extends React.Component {
    render() {
        const { mstore, prop } = this.props;
        return (
            <input
                type="text"
                value={mstore[prop] || ""}
                onChange={e => {
                    console.log("mstore", mstore);
                    if (mstore.hasOwnProperty(prop)) {
                        console.log("has own prop");
                        mstore[prop] = e.target.value;
                    } else {
                        console.log("does not has own prop");
                        extendObservable(mstore, { [prop]: e.target.value });
                    }
                }}
            />
        );
    }
}

@observer class Text extends React.Component {
    render() {
        const { mstore, prop } = this.props;
        return <div>{mstore[prop] || ""}</div>;
    }
}
class MyApp1 extends React.Component {
    render() {
        console.log("MyApp1 called>>>>>")
        return (
            <div>
                <TextInput mstore={mstore} prop="name" />
                <Text mstore={mstore} prop="name" />
            </div>
        );
    }
}
@observer class MyApp extends React.Component {
    componentWillMount() {
        setTimeout(() => {
            store.setValues({ qty: 500, rate: 100, amount: 60000 });
        }, 1000);
    }

    render() {
        return (
            <div>
                <input type="number" value={store.qty} onChange={e => (store.qty = e.target.value)} />
                <input type="number" value={store.rate} onChange={e => (store.rate = e.target.value)} />
                <div>Amount : {store.amount}</div>
                <div>CAmount : {store.cAmount}</div>
            </div>
        );
    }
}
export default MyApp1;
