
const List = ({ list }) =>
    <div className="list">
        {list.map(item => <div className="list-row" key={item.objectID}>
            <a href={item.url}>{item.title}</a>
        </div>)}
    </div>

class List extends React.Component {
    componentDidMount() {
        window.addEventListener('scroll', this.onScroll, false);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.onScroll, false);
    }

    onScroll = () => {
        if (
            (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 500) &&
            this.props.list.length
        ) {
            this.props.onPaginatedSearch();
        }
    }

    render() {
        const { list } = this.props;
        return (
            <div className="list">
                {list.map(item => <div className="list-row" key={item.objectID}>
                    <a href={item.url}>{item.title}</a>
                </div>)}
            </div>
        )
    };
}
