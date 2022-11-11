import * as React from 'react';
import { useEffect, useState } from 'react';
import { ICustomerFormProps } from './ICustomerFormProps';
import { Button, Form, Input, Tooltip, Transfer, BackTop, Spin, Tag, Select, Popover, Card, Statistic, Avatar, Image, Divider, Row, Col } from 'antd';
import { InfoCircleOutlined, UserOutlined, MailOutlined, TagOutlined, CalendarOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import 'antd/dist/antd.css';
import { TransferDirection } from 'antd/lib/transfer';
import { IRecordType } from '../../model/IRecordType';
import { IFormData } from '../../model/IFormData';
import CustomerMapper from '../../mapper/CustomerMapper';
import SharePointService from '../../services/SharePointService';
import { IItemAddResult } from '@pnp/sp/items';
import { StatusMessage } from '../Result/StatusMessage';
import { LogHelper } from '../../helpers/LogHelper';
import { DisplayMode, FormDisplayMode, Guid } from '@microsoft/sp-core-library';
import { IProject } from '../../model/IProject';
import styled from 'styled-components';
import styles from '../FormContainer/FormContainer.module.scss';
import { TaxonomyPicker, IPickerTerms } from "@pnp/spfx-controls-react/lib/TaxonomyPicker";
import { ModernTaxonomyPicker } from "@pnp/spfx-controls-react/lib/ModernTaxonomyPicker";
import { Icon } from '@fluentui/react/lib/Icon';

const MapIcon = () => <Icon iconName="MapPin" />;
const TagIcon = () => <Icon iconName='Tag' />;

const { Option } = Select;
const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
    },
};
const tailFormItemLayout = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 13,
            offset: 11,
        },
    },
};

const PopoverContainer = styled.div`
        display: flex;
        margin-bottom: 0.4em;
        color: #000000d9;
        overflow-wrap: break-word;
`;
const PopoverContentRow = styled.div`
        flex-direction: row;
        display: flex;
        justify-content: space-between;
        width: 100%;        
        border-radius: 5px;
        border: 1px solid #eee;

        &:before {
        border-width: 0px;
        border-style: solid;
        box-sizing: border-box;
        border-color: $ms-color-gray10;
        overflow-wrap: break-word;        
        }
        &:after{
            border-width: 0px;
            border-style: solid;
            box-sizing: border-box;
            border-color: $ms-color-gray10;
            overflow-wrap: break-word;        
        }
`;
const PopoverMetadata = styled.div`
        display: flex;
        -webkit-box-align: center;
        align-items: center;
        flex-direction: row;
`;
const MetadataIcon = styled.div`
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        flex-grow: 0;
        width: 2.5rem;
        height: 2.5rem;
        background: #f7fafc;        
`;
const MetadataContent = styled.div`
        margin: 0 5px;
        .title{
            font-weight: 500;
            margin: 0;
        }
        .tag{
            color: #4a5568;
            margin: 0;
            font-size: 13px;
        }
        .ant-avatar-group .ant-avatar {
            margin: 0 20px;
          }  
`;




export const CustomerForm: React.FunctionComponent<ICustomerFormProps> = (props) => {

    const [form] = Form.useForm();
    const [targetKeys, setTargetKeys] = useState<string[]>(props.listItem.ProjectsId ? props.listItem.ProjectsId : []);
    const [selectedInterests, setSelectedInterests] = useState<string[]>(props.listItem.Interests ? props.listItem.Interests : []);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const [mockData, setMockData] = useState([]);
    const [projects, setProjects] = useState([]);
    const [locationsTermSetId, setLocationsTermSetId] = useState<string>(Guid.empty.toString());
    const [locationsTextField, setLocationsTextField] = useState<string>('');
    const [customerContentTypeId, setCustomerContentTypeId] = useState<string>('');

    const popoverInnerContainer: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    }

    const getProjectListItems = async () => {

        const response: any[] = await SharePointService.getProjects("Projects");

        const mappedResponse = response.map((item: any, index) => {
            return {
                key: item.Id.toString(),
                title: `${item.Title}`,
                description: `${item.Title.toString()}`,
                chosen: false
            } as IRecordType
        });
        setProjects(mappedResponse);

    }

    useEffect(() => {
        getProjectListItems();
        getLocationsFieldDetails(props.listGuid);
        getCustomerContentTypeId(props.listGuid);
    }, []);

    const getLocationsFieldDetails = async (listId: Guid) => {
        const locationsDetails: {TermSetId: string, TextField: string} = await SharePointService.getLocationsFieldDetails(listId);
        setLocationsTermSetId(locationsDetails.TermSetId);
        setLocationsTextField(locationsDetails.TextField);
    }

    const getCustomerContentTypeId = async (listId: Guid) => {
        const customerContentTypeId = await SharePointService.getCustomerContentTypeId(listId);
        setCustomerContentTypeId(customerContentTypeId);
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));

    const onFinish = async (values: any) => {

        try {
            setLoading(true);
            setIsSuccess(false);
            setIsError(false);
            let response: any;
            const formData: IFormData = CustomerMapper.mapRequestFormData(values);
            const locationTaxFieldData = values.customerslocations && values.customerslocations.length > 0
                ? CustomerMapper.getManagedMetadataFieldValue(values.customerslocations) : null;
            formData[locationsTextField] = locationTaxFieldData;
            formData['ContentTypeId'] = customerContentTypeId;

            if (props.displayMode == FormDisplayMode.New) {
                response = await SharePointService.AddCustomer(formData);
            }
            if (props.displayMode == FormDisplayMode.Edit) {
                response = await SharePointService.UpdateCustomer(formData, props.itemID);
            }
            if (response.data) {
                setIsSuccess(true);
                setLoading(false);
                await delay(3000);
                props.onSave();
            }
            else {
                setIsError(true);
                setLoading(false);
            }

        }
        catch (err) {
            LogHelper.error('NewForm', 'onFinish', err);
            await delay(5000);
            setLoading(false);
            setIsError(true);
            resetForm();
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const resetForm = () => {
        form.resetFields();
        setTargetKeys([]);
    }
    const onCancel = () => {
        resetForm();
        props.onClose();
    };

    const handleLookupChange = (newTargetKeys: string[], direction: TransferDirection, moveKeys: string[]) => {
        console.log(newTargetKeys, direction, moveKeys);
        setTargetKeys(newTargetKeys);
    };

    const handleLookupSearch = (dir: TransferDirection, value: string) => {
        console.log('search:', dir, value);
    };

    const handlelookupFilterOption = (inputValue: string, option: IRecordType) =>
        option.description.indexOf(inputValue) > -1;


    const getSuccessStatusTitle = (displayMode: FormDisplayMode) => {
        let hashMap = new Map([
            [FormDisplayMode.New, "Customer detail successfully added!"],
            [FormDisplayMode.Edit, "Customer detail successfully updated!"]
        ]);
        return hashMap.get(displayMode);
    }

    const getInitials = (fullName: string) => {
        var names = fullName.split(' '),
            initials = names[0].substring(0, 1).toUpperCase();

        if (names.length > 1) {
            initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }
        return initials;
    };

    const renderProjectAdditionalDetail = (project: IProject) => {
        return (<>
            <PopoverContainer>
                <PopoverContentRow>
                    <PopoverMetadata>
                        <MetadataIcon><InfoCircleOutlined /></MetadataIcon>
                        <MetadataContent>
                            <div className='title'>Status</div>
                            <div className='tag'>{project.Status}</div>
                        </MetadataContent>
                    </PopoverMetadata>
                </PopoverContentRow>
            </PopoverContainer>
            <PopoverContainer>
                <PopoverContentRow>
                    <PopoverMetadata>
                        <MetadataIcon><CalendarOutlined /></MetadataIcon>
                        <MetadataContent>
                            <div className='title'>Start date</div>
                            <div className='tag'>{project.StartDate}</div>
                        </MetadataContent>
                    </PopoverMetadata>
                </PopoverContentRow>
            </PopoverContainer>
            <Divider />
            <PopoverContainer>
                <PopoverContentRow>
                    <PopoverMetadata>
                        <MetadataContent>
                            <div className='title'>Members</div>
                            <Avatar.Group>
                                {project.Members.length > 0 && project.Members.map((member: any, index) => {
                                    return <Tooltip title={member.Title} placement="top"><Avatar key={index} src={<Image src={`${props.siteUrl}/_layouts/15/userphoto.aspx?size=L&username=${member.EMail}`} style={{ width: 32 }} />} >{member.Title}</Avatar></Tooltip>
                                })}
                            </Avatar.Group>
                        </MetadataContent>
                    </PopoverMetadata>

                </PopoverContentRow>
            </PopoverContainer>
        </>);
    }

    const renderProjectTags = () => {
        return props.listItem.Projects.map((proj, index) => {

            return (
                <Popover
                    trigger="hover"
                    content={renderProjectAdditionalDetail(proj)}
                    overlayStyle={{ minWidth: '400px' }}
                    placement="topLeft"
                    title={proj.Title}
                    arrowPointAtCenter>
                    <Tag style={{ cursor: 'pointer' }} icon={<TagOutlined />} key={index} color={(window as any).__themeState__.theme.themePrimary}>{proj.Title}</Tag>
                </Popover>
            )
        });
    }
    const renderInterestsTags = () => {
        return props.listItem.Interests.map((interest, index) => {
            return (
                <Tag key={index} color="default"> {interest}</Tag>
            )

        });
    }
    
    const renderLocationTags = () => {
        return props.listItem.CustomerLocations.map((location, index) => {
            return (
                <Tag icon={<MapIcon />} key={index} color="default"> {location.labels[0].name}</Tag>
            )

        });
    }


    const handleInterestChange = (value: string[]) => {
        console.log(`selected ${value}`);
        setSelectedInterests(value);
    };

    const renderInterests = selectedInterests && selectedInterests.length > 0 && selectedInterests.map((item, index) => {
        return <Option key={index}>{item}</Option>
    });

    const onTaxPickerChange = (terms: any[]) => {
        console.log("Terms", terms);
    }

    return (
        <>
            {isSuccess && <StatusMessage resultType={"success"} title={getSuccessStatusTitle(props.displayMode)} onClose={() => onCancel()} />}
            {isError && <StatusMessage resultType={"error"} title="Submission Failed!" subTitle='Please try again or contact your administrator.' />}
            {isSuccess || isError ? null :
                <Form
                    className={props.displayMode == FormDisplayMode.Display && styles.viewForm}
                    form={form}
                    name="basic"
                    layout="vertical"
                    initialValues={{ title: props.listItem.Title, email: props.listItem.Email, workaddress: props.listItem.WorkAddress, interests: selectedInterests, projects: targetKeys, customerslocations: props.listItem.CustomerLocations }}
                    size={"large"}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"

                >

                    <BackTop />

                    <Row>
                        <Col span={11}>
                            <Form.Item
                                label="Name"
                                name="title"
                                hasFeedback
                                rules={[{ required: true, message: 'Please input your full name!' }]}
                            >
                                <Input
                                    readOnly={props.displayMode == FormDisplayMode.Display}
                                    placeholder="Full name"
                                    prefix={<UserOutlined className="site-form-item-icon" />}
                                    suffix={
                                        <Tooltip title="Please enter your full name">
                                            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                        </Tooltip>
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col offset={1} span={11}>
                            <Form.Item
                                label="Email"
                                name="email"
                                hasFeedback
                                rules={[{ required: true, type: 'email', message: 'Please input valid email address!' }]}
                            >
                                <Input
                                    readOnly={props.displayMode == FormDisplayMode.Display}
                                    placeholder="Email"
                                    prefix={<MailOutlined className="site-form-item-icon" />}
                                    suffix={
                                        <Tooltip title="Please enter your email address">
                                            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                        </Tooltip>
                                    }
                                />
                            </Form.Item>

                        </Col>

                    </Row>

                    <Row>
                        <Col span={11}>      <Form.Item
                            label="Address"
                            name="workaddress"
                            rules={[{ required: false, message: 'Please input your address!' }]}
                        >
                            <Input.TextArea
                                readOnly={props.displayMode == FormDisplayMode.Display}
                                placeholder="Address"
                                showCount maxLength={100}
                            />
                        </Form.Item></Col>
                        <Col offset={1} span={11}><Form.Item
                            label="Interests"
                            name="interests"
                        >
                            {props.displayMode !== FormDisplayMode.Display ?
                                <Select
                                    mode="multiple"
                                    allowClear
                                    size={"large"}
                                    style={{ width: '100%' }}
                                    placeholder="Please select interests"
                                    onChange={handleInterestChange}
                                    defaultValue={selectedInterests}
                                >
                                    <Option value="Decorating">Decorating</Option>
                                    <Option value="Diving">Diving</Option>
                                    <Option value="Livestreaming">Livestreaming</Option>
                                    <Option value="Drawing">Drawing</Option>
                                    <Option value="Kung fu">Kung fu</Option>
                                </Select>
                                : props.listItem.Interests && props.listItem.Interests.length > 0 && renderInterestsTags()
                            }
                        </Form.Item></Col>
                    </Row>
                    { locationsTermSetId !== Guid.empty.toString() ? 
                        <Row>
                                <Col span={11}>
                                    <Form.Item
                                        label="Office Location"
                                        name="customerslocations"
                                        rules={[{ required: false, message: '' }]}
                                    >
                                        {props.displayMode !== FormDisplayMode.Display ?
                                            <ModernTaxonomyPicker allowMultipleSelections={true}
                                                termSetId={locationsTermSetId}
                                                panelTitle="Select location"
                                                label=""
                                                initialValues={props.listItem.CustomerLocations}
                                                context={props.context as any}
                                                onChange={onTaxPickerChange}
                                            />
                                            : props.listItem.CustomerLocations && props.listItem.CustomerLocations.length > 0 && renderLocationTags()
                                        }
                                    </Form.Item>
                                </Col>
                                <Col offset={1} span={11}>

                                </Col>
                        </Row>
                    : null }

                    <Row>
                        <Col span={24}>
                            <Form.Item
                                label="Associated Projects"
                                name="projects"
                            >
                                {props.displayMode !== FormDisplayMode.Display ?
                                    <Transfer
                                        dataSource={projects}
                                        targetKeys={targetKeys}
                                        titles={['Source', 'Target']}
                                        onChange={handleLookupChange}
                                        onSearch={handleLookupSearch}
                                        filterOption={handlelookupFilterOption}
                                        render={item => item.title}
                                        oneWay={true}
                                        pagination
                                        showSearch />
                                    : props.listItem.Projects && props.listItem.Projects.length > 0 && renderProjectTags()
                                }
                            </Form.Item>

                        </Col>
                    </Row>


                    <Row>
                        <Col span={24}>
                            <Spin spinning={loading}>
                                <Form.Item style={{ marginTop: '40px' }} {...tailFormItemLayout}>

                                    <Button style={{ marginRight: '10px' }} type="default" htmlType="button" onClick={() => onCancel()}>
                                        Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit" hidden={props.displayMode === FormDisplayMode.Display}>
                                        Submit
                                    </Button>
                                </Form.Item>
                            </Spin>
                        </Col>
                    </Row>

                </Form>
            }

        </>
    );
};

