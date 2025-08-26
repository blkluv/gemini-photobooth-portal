# Admin Manual

This guide is for administrators and operators of the Gemini Photobooth Portal system.

## System Overview

The photobooth system consists of three main components:
- **React Frontend**: User interface and photobooth functionality
- **PHP Backend**: File uploads, QR generation, key management
- **DSLR Helper Backend**: Camera control and media capture

## Accessing Admin Functions

### Admin PIN Access
1. **Enter Admin PIN**: Use the admin PIN to unlock administrative functions
2. **Access Admin Panel**: Click the admin settings icon in the main menu
3. **Multi-Tab Interface**: Navigate between different admin functions

### Admin Panel Tabs

#### General Settings
- **System Status**: Monitor all system components
- **Version Information**: Check current software versions
- **Basic Configuration**: Set system preferences
- **Restart Services**: Restart individual components

#### Security Settings
- **Key Management**: Manage event and trial keys
- **Access Control**: Configure user permissions
- **Security Logs**: View security-related events
- **Password Management**: Update admin credentials

#### Analytics Dashboard
- **Usage Statistics**: View system usage data
- **Performance Metrics**: Monitor system performance
- **User Activity**: Track user interactions
- **Export Reports**: Generate usage reports

#### Branding & Customization
- **Logo Upload**: Upload company logo
- **Color Scheme**: Customize interface colors
- **Company Information**: Update contact details
- **Custom Messages**: Set welcome and help messages

#### Support & Maintenance
- **Support Requests**: View and manage support tickets
- **System Logs**: Access detailed system logs
- **Update Management**: Check for software updates
- **Backup & Restore**: Manage system backups

#### Device Management
- **Camera Status**: Monitor DSLR camera connection
- **Printer Status**: Check printer connectivity
- **Network Status**: Monitor network connections
- **Hardware Diagnostics**: Run hardware tests

## Key Management

### Event Keys
Event keys provide long-term access for specific events or installations.

#### Creating Event Keys
1. **Access Security Settings**: Go to Security tab in admin panel
2. **Generate New Key**: Click "Create Event Key"
3. **Configure Settings**:
   - **Key Name**: Descriptive name for the key
   - **Expiration Date**: Set when the key expires
   - **Usage Limits**: Set maximum uploads per key
   - **Permissions**: Configure allowed features
4. **Save Key**: Store the key securely

#### Managing Event Keys
- **View All Keys**: List all active and expired keys
- **Edit Key**: Modify key settings or extend expiration
- **Revoke Key**: Immediately disable a key
- **Usage Reports**: View usage statistics per key

### Trial Keys
Trial keys provide temporary access for testing or short-term use.

#### Trial Key System
- **Automatic Generation**: System generates trial keys on demand
- **Email Delivery**: Keys are sent via email
- **Time Limits**: 1-hour expiration by default
- **Rate Limiting**: 3 trial requests per hour per IP

#### Managing Trial Keys
- **View Active Trials**: See all active trial keys
- **Extend Trials**: Extend trial duration if needed
- **Revoke Trials**: Cancel active trials
- **Trial Analytics**: Track trial usage patterns

## System Monitoring

### Real-Time Monitoring
- **System Health**: Monitor all component status
- **Performance Metrics**: Track response times and throughput
- **Error Logs**: View and analyze error messages
- **User Activity**: Monitor active users and sessions

### Alert System
- **Critical Alerts**: Immediate notification for system failures
- **Warning Alerts**: Notifications for potential issues
- **Info Alerts**: General system information
- **Alert Configuration**: Customize alert thresholds

### Log Management
- **Access Logs**: Track all system access
- **Error Logs**: Record system errors and exceptions
- **Security Logs**: Monitor security events
- **Performance Logs**: Track system performance

## Camera Management

### DSLR Camera Setup
1. **Connect Camera**: Ensure camera is properly connected via USB
2. **Check Connection**: Verify camera is detected by the system
3. **Test Capture**: Perform test captures to ensure functionality
4. **Configure Settings**: Set camera parameters for optimal results

### Camera Settings
- **Aperture**: Control depth of field
- **Shutter Speed**: Manage motion blur and exposure
- **ISO**: Adjust light sensitivity
- **White Balance**: Ensure accurate color reproduction
- **Focus Mode**: Set autofocus or manual focus

### Camera Maintenance
- **Battery Monitoring**: Track camera battery levels
- **Storage Management**: Monitor camera storage space
- **Firmware Updates**: Keep camera firmware current
- **Cleaning Schedule**: Regular lens and sensor cleaning


## Printer Management

### Print API Integration
- The frontend now sends print jobs directly to the backend at `http://localhost:3000/api/print`.
- Print jobs require an `X-DSLR-Token` header for authentication.
- The print size is selected by the user in the frontend and sent as `printSize` (4R, 5R, 6R, A4).
- The image is sent as a base64 string in the `imageBase64` field.
- Print jobs are processed automatically when the user confirms print.

### Printer Setup
1. **Connect Printer**: Ensure printer is properly connected
2. **Install Drivers**: Install necessary printer drivers
3. **Configure Backend**: Ensure backend is running and token authentication is enabled
4. **Test Prints**: Perform test prints to verify setup

### Print Settings
- **Paper Size**: User selects from available sizes in frontend; backend receives as `printSize`
- **Authentication**: All print jobs require a valid token

### Printer Maintenance
- **Paper Management**: Monitor paper levels
- **Ink/Toner Levels**: Track consumable levels
- **Print Head Cleaning**: Regular maintenance cleaning
- **Calibration**: Periodic color and alignment calibration

## Analytics and Reporting

### Usage Analytics
- **Upload Statistics**: Track media uploads by type
- **User Engagement**: Monitor user interaction patterns
- **Feature Usage**: Track which features are most popular
- **Geographic Data**: Monitor usage by location

### Performance Analytics
- **Response Times**: Track system response times
- **Error Rates**: Monitor system error frequencies
- **Resource Usage**: Track CPU, memory, and storage usage
- **Network Performance**: Monitor network connectivity

### Custom Reports
- **Report Builder**: Create custom analytics reports
- **Scheduled Reports**: Set up automated report generation
- **Export Options**: Export data in various formats
- **Data Visualization**: Create charts and graphs

## Backup and Recovery

### Backup Strategy
- **Regular Backups**: Schedule automatic system backups
- **Incremental Backups**: Efficient backup of changed data
- **Offsite Storage**: Store backups in secure offsite location
- **Backup Verification**: Regularly test backup integrity

### Recovery Procedures
- **System Recovery**: Restore system from backup
- **Data Recovery**: Recover specific data files
- **Configuration Recovery**: Restore system settings
- **Disaster Recovery**: Complete system restoration

### Backup Management
- **Backup Scheduling**: Configure automatic backup schedules
- **Retention Policies**: Set backup retention periods
- **Storage Management**: Monitor backup storage usage
- **Backup Testing**: Regular testing of backup procedures

## Troubleshooting

### Common Issues

#### Camera Connection Problems
- **Check USB Connection**: Ensure camera is properly connected
- **Verify Camera Mode**: Ensure camera is in PTP mode
- **Test with gphoto2**: Use command line tools to test connection
- **Check Permissions**: Verify system permissions for camera access

#### Upload Failures
- **Check File Size**: Verify files are within size limits
- **Validate File Types**: Ensure files are supported formats
- **Check Storage Space**: Verify sufficient storage space
- **Review Error Logs**: Check detailed error messages

#### Printer Issues
- **Check Connection**: Verify printer is connected and online
- **Paper Status**: Ensure paper is loaded correctly
- **Driver Issues**: Reinstall or update printer drivers
- **Print Queue**: Check and clear print queue if needed

#### Network Problems
- **Check Connectivity**: Verify network connection
- **Firewall Settings**: Ensure ports are open
- **DNS Issues**: Check domain name resolution
- **Bandwidth**: Monitor network bandwidth usage

### Diagnostic Tools

#### System Diagnostics
- **Health Check**: Run comprehensive system health check
- **Component Tests**: Test individual system components
- **Performance Tests**: Measure system performance
- **Network Tests**: Verify network connectivity

#### Log Analysis
- **Error Analysis**: Analyze error log patterns
- **Performance Analysis**: Review performance logs
- **Security Analysis**: Monitor security event logs
- **User Activity Analysis**: Review user activity patterns

## Security Management

### Access Control
- **User Authentication**: Manage user access and permissions
- **Session Management**: Monitor and control user sessions
- **IP Restrictions**: Configure IP-based access controls
- **Time-based Access**: Set time-based access restrictions

### Security Monitoring
- **Intrusion Detection**: Monitor for unauthorized access
- **Anomaly Detection**: Identify unusual system behavior
- **Security Logs**: Review security-related events
- **Vulnerability Scanning**: Regular security assessments

### Data Protection
- **Encryption**: Ensure data is properly encrypted
- **Privacy Compliance**: Maintain privacy standards
- **Data Retention**: Manage data retention policies
- **Secure Deletion**: Properly dispose of sensitive data

## Updates and Maintenance

### Software Updates
- **Update Checking**: Regularly check for software updates
- **Update Testing**: Test updates in staging environment
- **Update Deployment**: Deploy updates during maintenance windows
- **Rollback Procedures**: Maintain ability to rollback updates

### System Maintenance
- **Regular Maintenance**: Schedule regular maintenance windows
- **Performance Optimization**: Optimize system performance
- **Storage Cleanup**: Regular cleanup of temporary files
- **Log Rotation**: Manage log file sizes and rotation

### Documentation
- **Change Logs**: Document all system changes
- **Configuration Management**: Track configuration changes
- **Procedure Documentation**: Maintain up-to-date procedures
- **Training Materials**: Keep training materials current

## Emergency Procedures

### System Failures
1. **Assess Impact**: Determine scope of the failure
2. **Implement Workarounds**: Use backup systems if available
3. **Contact Support**: Notify technical support team
4. **Document Incident**: Record details of the failure
5. **Implement Recovery**: Follow recovery procedures

### Data Loss
1. **Stop Operations**: Halt system operations immediately
2. **Assess Damage**: Determine extent of data loss
3. **Initiate Recovery**: Begin data recovery procedures
4. **Notify Stakeholders**: Inform relevant parties
5. **Implement Prevention**: Strengthen backup procedures

### Security Breaches
1. **Isolate System**: Disconnect from network if necessary
2. **Assess Threat**: Determine nature and scope of breach
3. **Contain Breach**: Limit spread of security issue
4. **Notify Authorities**: Contact appropriate authorities
5. **Implement Fixes**: Apply security patches and fixes

---

*For technical support or emergency assistance, contact the support team immediately.* 